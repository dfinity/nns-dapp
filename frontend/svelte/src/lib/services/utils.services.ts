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

let lastIndex: number = Math.round(Math.random() * 100000);

/**
 * Makes two requests (QUERY and UPDATE) in parallel.
 * The returned promise notify when first fetched data are available.
 * Could call onLoad only once if the update response was first.
 */
export const queryAndUpdate = async <R, E>({
  request,
  onLoad,
  onError,
  logMessage,
}: {
  request: (options: { certified: boolean; identity: Identity }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  logMessage?: string;
  onError?: QueryAndUpdateOnError<E>;
}): Promise<void> => {
  let certifiedDone = false;
  const identity: Identity = await getIdentity();

  const logPrefix = `[${lastIndex++}] ${logMessage ?? ""}`;
  logWithTimestamp(`${logPrefix} calls...`);

  return Promise.race([
    // query
    request({ certified: false, identity })
      .then((response) => {
        logWithTimestamp(`${logPrefix} query complete.`);
        if (certifiedDone) return;
        onLoad({ certified: false, response });
      })
      .catch((error: E) => {
        // TODO: somehow notify user about probably compromised state
        if (certifiedDone) return;
        onError?.({ certified: false, error });
      }),

    // update
    request({ certified: true, identity })
      .then((response) => {
        logWithTimestamp(`${logPrefix} update complete.`);
        onLoad({ certified: true, response });
      })
      .catch((error) => onError?.({ certified: true, error }))
      .finally(() => (certifiedDone = true)),
  ]);
};
