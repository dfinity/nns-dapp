import {
  getAnonymousIdentity,
  getAuthenticatedIdentity,
  getCurrentIdentity,
} from "$lib/services/auth.services";
import { canistersErrorsStore } from "$lib/stores/canisters-errors.store";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";

export type QueryAndUpdateOnResponse<R> = (options: {
  certified: boolean;
  strategy: QueryAndUpdateStrategy;
  response: R;
}) => void;

export type QueryAndUpdateOnError<E> = (options: {
  certified: boolean;
  strategy: QueryAndUpdateStrategy;
  error: E;
  // The identity used for the request
  identity: Identity;
}) => void;

export type QueryAndUpdateStrategy = "query_and_update" | "query" | "update";

export type QueryAndUpdateIdentity = "authorized" | "anonymous" | "current";

let lastIndex = 0;

type QueryAndUpdateParams<R, E> = {
  request: (options: { certified: boolean; identity: Identity }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  logMessage: string;
  onError?: QueryAndUpdateOnError<E>;
  strategy?: QueryAndUpdateStrategy;
  identityType?: QueryAndUpdateIdentity;
};

const isQueryCallOfAQueryAndUpdateCall = (
  strategy: QueryAndUpdateStrategy,
  certified: boolean
) => strategy === "query_and_update" && certified === false;

export const queryAndUpdateWithCanisterErrorTrack = async <R, E>({
  request,
  onLoad,
  onError,
  strategy,
  logMessage,
  identityType = "authorized",
  canisterId,
  // TOOD(yhabib): Change type of canisterId from string to CanisterId
}: QueryAndUpdateParams<R, E> & { canisterId: string }): Promise<void> => {
  const customOnLoad: QueryAndUpdateOnResponse<R> = ({
    certified,
    strategy,
    response,
  }) => {
    if (!isQueryCallOfAQueryAndUpdateCall(strategy, certified))
      canistersErrorsStore.delete(canisterId);

    onLoad({ certified, strategy, response });
  };

  const customOnError: QueryAndUpdateOnError<E> = ({
    certified,
    strategy,
    error,
    identity,
  }) => {
    if (!isQueryCallOfAQueryAndUpdateCall(strategy, certified))
      canistersErrorsStore.set({ canisterId, rawError: error });

    onError?.({ certified, strategy, error, identity });
  };

  return queryAndUpdate({
    request,
    onLoad: customOnLoad,
    onError: customOnError,
    strategy,
    logMessage,
    identityType,
  });
};

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
}: QueryAndUpdateParams<R, E>): Promise<void> => {
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
    : (strategy ?? "query_and_update");

  const log = ({ postfix }: { postfix: string }) => {
    if (currentStrategy !== "query_and_update") {
      return;
    }
    logPrefix = logPrefix ?? `[${lastIndex++}] ${logMessage}`;
    logWithTimestamp(`${logPrefix} calls${postfix}`);
  };

  const queryOrUpdate = (certified: boolean) =>
    request({ certified, identity })
      .then((response) => {
        if (certifiedDone) return;
        certifiedDone ||= certified;

        onLoad({ certified, strategy: currentStrategy, response });
        log({ postfix: ` ${certified ? "update" : "query"} complete.` });
      })
      .catch((error: E) => {
        if (certifiedDone) return;
        certifiedDone ||= certified;
        onError?.({ certified, strategy: currentStrategy, error, identity });
      });

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
