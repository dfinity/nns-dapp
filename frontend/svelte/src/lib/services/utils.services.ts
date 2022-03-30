import type { Identity } from "@dfinity/agent";
import { getIdentity } from "./auth.services";

export type QueryAndUpdateOnResponse<R> = (options: {
  certified: boolean;
  response: R;
}) => void;

export type QueryAndUpdateOnError<E> = (options: {
  certified: boolean;
  error: E;
}) => void;

/**
 * Makes two requests (QUERY and UPDATE) in parallel.
 * The returned promise notify when first fetched data are available.
 * Could call onLoad only once if the update response was first.
 */
export const queryAndUpdate = async <R, E>({
  request,
  onLoad,
  onError,
}: {
  request: (options: { certified: boolean; identity: Identity }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  onError?: QueryAndUpdateOnError<E>;
}): Promise<void> => {
  let certifiedDone = false;

  const identity: Identity = await getIdentity();

  return Promise.race([
    // query
    request({ certified: false, identity })
      .then((response) => {
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
      .then((response) => onLoad({ certified: true, response }))
      .catch((error) => onError?.({ certified: true, error }))
      .finally(() => (certifiedDone = true)),
  ]);
};
