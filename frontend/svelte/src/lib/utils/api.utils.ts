export type QueryAndUpdateOnResponse<R> = (options: {
  certified: boolean | undefined;
  response: R;
}) => void;

export type QueryAndUpdateOnError<E> = (options: {
  certified: boolean | undefined;
  error: E;
}) => void;

/**
 * Makes two requests (QUERY and UPDATE) in parallel.
 * The returned promise notify when first fetched data are available.
 */
export const queryAndUpdate = <R, E>({
  request,
  onLoad,
  onError,
}: {
  request: (options: { certified: boolean }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  onError?: QueryAndUpdateOnError<E>;
}): Promise<void> => {
  let certifiedDone = false;

  return Promise.race([
    // query
    request({ certified: false })
      .then((response) => {
        if (certifiedDone) return;
        onLoad({ certified: false, response });
      })
      .catch((error: E) => {
        if (certifiedDone) return;
        onError?.({ certified: false, error });
      }),

    // update
    request({ certified: true })
      .then((response) => onLoad({ certified: true, response }))
      .catch((error) => onError?.({ certified: true, error }))
      .finally(() => (certifiedDone = true)),
  ]);
};
