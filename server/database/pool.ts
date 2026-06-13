import { Worker } from "node:worker_threads";
import os from "node:os";
import type { ViewSlice } from "../view-slice.ts";

export interface ViewSliceResult {
  readonly rows: unknown[];
  readonly count: number;
}

interface Task {
  readonly view: ViewSlice;
  readonly resolve: (v: ViewSliceResult) => void;
  readonly reject: (e: Error) => void;
}

// One worker per available core (minus the main thread), so SQLite queries
// run off the main thread and can be served concurrently.
const POOL_SIZE = Math.max(1, Math.min(4, os.cpus().length - 1));

class ViewSliceWorkerPool {
  readonly #workerUrl: URL;
  readonly #idle: Worker[] = [];
  readonly #queue: Task[] = [];
  readonly #inFlight = new Map<Worker, Task>();

  constructor(workerUrl: URL, size: number) {
    this.#workerUrl = workerUrl;
    for (let i = 0; i < size; i++) this.#spawn();
    console.log(`[pool] ready with ${size} view-slice worker(s)`);
  }

  #spawn() {
    const worker = new Worker(this.#workerUrl);

    worker.on("message", (msg: ViewSliceResult | { error: string }) => {
      const task = this.#inFlight.get(worker);
      this.#inFlight.delete(worker);

      if (task) {
        if ("error" in msg) task.reject(new Error(msg.error));
        else task.resolve(msg);
      }

      this.#idle.push(worker);
      this.#dispatch();
    });

    worker.on("error", (err) => {
      console.error("view-slice worker error:", err);

      const task = this.#inFlight.get(worker);
      this.#inFlight.delete(worker);
      task?.reject(err);
    });

    worker.on("exit", () => {
      const idx = this.#idle.indexOf(worker);
      if (idx !== -1) this.#idle.splice(idx, 1);

      // Keep pool capacity stable if a worker dies unexpectedly.
      this.#spawn();
      this.#dispatch();
    });

    this.#idle.push(worker);
  }

  #dispatch() {
    if (!this.#queue.length || !this.#idle.length) return;

    const worker = this.#idle.shift()!;
    const task = this.#queue.shift()!;
    this.#inFlight.set(worker, task);
    worker.postMessage(task.view);
  }

  run(view: ViewSlice): Promise<ViewSliceResult> {
    return new Promise((resolve, reject) => {
      this.#queue.push({ view, resolve, reject });

      // All workers are busy, so this task (and possibly others) will wait.
      if (this.#queue.length > this.#idle.length) {
        console.log(
          `[pool] all workers busy, queue depth = ${this.#queue.length}`,
        );
      }

      this.#dispatch();
    });
  }
}

const pool = new ViewSliceWorkerPool(
  new URL("./worker.ts", import.meta.url),
  POOL_SIZE,
);

export function runViewSlice(view: ViewSlice): Promise<ViewSliceResult> {
  return pool.run(view);
}
