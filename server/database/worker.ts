import { parentPort } from "node:worker_threads";
import Database from "better-sqlite3";
import { buildViewQuery, type ViewSlice } from "../view-slice.ts";

if (!parentPort) throw new Error("worker.ts must be run as a worker thread");

const db = new Database(`${import.meta.dirname}/movies.db`, {
  readonly: true,
  fileMustExist: true,
});

parentPort.on("message", (view: ViewSlice) => {
  try {
    const { query, queryCount, params, limitParams } = buildViewQuery(view);

    const rows = db.prepare(query).all(...params, ...limitParams);
    const count = (db.prepare(queryCount).get(...params) as { cnt: number })
      .cnt;

    parentPort!.postMessage({ rows, count });
  } catch (err) {
    parentPort!.postMessage({
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
