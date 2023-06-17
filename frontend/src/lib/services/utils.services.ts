import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import {
  getAnonymousIdentity,
  getAuthenticatedIdentity,
  getCurrentIdentity,
} from "./auth.services";

export type QueryAndUpdateOnResponse<R> = (options: {
  certified: boolean;
  response: R;
}) => void;

export type QueryAndUpdateOnError<E> = (options: {
  certified: boolean;
  error: E;
  // The identity used for the request
  identity: Identity;
}) => void;

export type QueryAndUpdateStrategy = "query_and_update" | "query" | "update";

export type QueryAndUpdateIdentity = "authorized" | "anonymous" | "current";

let lastIndex = 0;

/**
 * Depending on the strategy makes one or two requests (QUERY and UPDATE in parallel).
 * The returned promise notify when first fetched data are available.
 * Could call onLoad only once if the update response was first.
 *
 * If the user is not authenticated, strategies other than "query" will throw an error.
 */
export const queryAndUpdate = async <R, E>({
  request,
  onLoad,
  onError,
  strategy,
  logMessage,
  identityType = "authorized",
}: {
  request: (options: { certified: boolean; identity: Identity }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  logMessage?: string;
  onError?: QueryAndUpdateOnError<E>;
  strategy?: QueryAndUpdateStrategy;
  identityType?: QueryAndUpdateIdentity;
}): Promise<void> => {
  let certifiedDone = false;
  let requests: Array<Promise<void>>;
  let logPrefix: string;

  const identity: Identity =
    identityType === "anonymous"
      ? getAnonymousIdentity()
      : identityType === "current"
      ? getCurrentIdentity()
      : await getAuthenticatedIdentity();

  if (
    identity.getPrincipal().isAnonymous() &&
    strategy !== undefined &&
    strategy !== "query"
  ) {
    throw new Error(
      "Cannot use strategy other than 'query' for anonymous identity."
    );
  }

  const currentStrategy = identity.getPrincipal().isAnonymous()
    ? "query"
    : strategy ?? "query_and_update";

  const log = ({ postfix }: { postfix: string }) => {
    if (currentStrategy !== "query_and_update") {
      return;
    }
    logPrefix = logPrefix ?? `[${lastIndex++}] ${logMessage ?? ""}`;
    logWithTimestamp(`${logPrefix} calls${postfix}`);
  };

  const queryOrUpdate = (certified: boolean) =>
    request({ certified, identity })
      .then((response) => {
        if (certifiedDone) return;
        onLoad({ certified, response });
        log({ postfix: ` ${certified ? "update" : "query"} complete.` });
      })
      .catch((error: E) => {
        if (certifiedDone) return;
        onError?.({ certified, error, identity });
      })
      .finally(() => (certifiedDone = certifiedDone || certified));

  // apply fetching strategy
  if (currentStrategy === "query") {
    requests = [queryOrUpdate(false)];
  } else if (currentStrategy === "update") {
    requests = [queryOrUpdate(true)];
  } else {
    requests = [queryOrUpdate(false), queryOrUpdate(true)];
  }

  log({ postfix: "..." });

  await Promise.race(requests);
};
