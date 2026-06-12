import {
  type DataRequest,
  type DataResponse,
  type DataResponsePinned,
} from "@1771technologies/lytenyte-pro";
import type { Model } from "./types";

export async function fetchSlice(req: {
  model: Model;
  reqs: DataRequest[];
}): Promise<(DataResponse | DataResponsePinned)[]> {
  return await fetch("/api/view-slice", {
    body: JSON.stringify(req),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).then((res) => res.json());
}
