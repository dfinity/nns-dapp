import type { Identity } from "@dfinity/agent";
import { logWithTimestamp } from "../utils/dev.utils";
import { getIdentity } from "./auth.services";

export type QueryAndUpdateOnResponse<R> = (options: {
  certified: boolean;
  response: R;
}) => void;

export type QueryAndUpdateOnError<E> = (options: {
  certified: boolean;
  error: E;
}) => void;

export type QueryAndUpdateStrategy = "query_and_update" | "query" | "update";
let lastIndex: number = 0;

/**
 * Depending on the strategy makes one or two requests (QUERY and UPDATE in parallel).
 * The returned promise notify when first fetched data are available.
 * Could call onLoad only once if the update response was first.
 */
export const queryAndUpdate = async <R, E>({
  request,
  onLoad,
  onError,
  strategy = "query_and_update",
  logMessage,
}: {
  request: (options: { certified: boolean; identity: Identity }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  logMessage?: string;
  onError?: QueryAndUpdateOnError<E>;
  strategy?: QueryAndUpdateStrategy;
}): Promise<void> => {
  let certifiedDone = false;
  let requests: Array<Promise<void>>;
  let logPrefix: string;
  const log = ({ postfix }: { postfix: string }) => {
    if (strategy !== "query_and_update") {
      return;
    }
    logPrefix = logPrefix ?? `[${lastIndex++}] ${logMessage ?? ""}`;
    logWithTimestamp(`${logPrefix} calls${postfix}`);
  };
  const identity: Identity = await getIdentity();
  const queryOrUpdate = (certified: boolean) =>
    request({ certified, identity })
      .then((response) => {
        if (certifiedDone) return;
        onLoad({ certified, response });
        log({ postfix: ` ${certified ? "update" : "query"} complete.` });
      })
      .catch((error: E) => {
        if (certifiedDone) return;
        onError?.({ certified, error });
      })
      .finally(() => (certifiedDone = certifiedDone || certified));

  // apply fetching strategy
  if (strategy === "query") {
    requests = [queryOrUpdate(false)];
  } else if (strategy === "update") {
    requests = [queryOrUpdate(true)];
  } else {
    requests = [queryOrUpdate(false), queryOrUpdate(true)];
  }

  log({ postfix: "..." });

  await Promise.race(requests);
};
