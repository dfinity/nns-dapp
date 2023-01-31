import { cachingCallsStore } from "$lib/stores/caching-calling.store";
import { ResponseCache } from "$lib/utils/cache.utils";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import {
  getAnonymousIdentity,
  getAuthenticatedIdentity,
  getCurrentIdentity,
} from "./auth.services";

type QueryAndUpdateResponseData<R> = {
  certified: boolean;
  response: R;
};

export type QueryAndUpdateOnResponse<R> = (
  options: QueryAndUpdateResponseData<R>
) => void;

export type QueryAndUpdateOnError<E> = (options: {
  certified: boolean;
  error: E;
}) => void;

export type QueryAndUpdateStrategy = "query_and_update" | "query" | "update";

export type QueryAndUpdateIdentity = "authorized" | "anonymous" | "current";

let lastIndex = 0;

type QueryAndUpdate<R, E> = {
  request: (options: { certified: boolean; identity: Identity }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  logMessage?: string;
  onError?: QueryAndUpdateOnError<E>;
  strategy?: QueryAndUpdateStrategy;
  identityType?: QueryAndUpdateIdentity;
  resetCache?: boolean;
};

type Calls<R, E> = {
  [key in QueryAndUpdateStrategy]: {
    onLoadListeners: QueryAndUpdateOnResponse<R>[];
    onErrorListeners: QueryAndUpdateOnError<E>[];
  };
};

/**
 * Typed cache. It is used to cache the response of a query and update.
 *
 * `createCachedQueryAndUpdate` returns a `queryAndUpdate` for a specific type.
 * That means that the cache is typed and it should match the onLoad and onRequest parameters used in the queryAndUpdate.
 *
 * That also means that two calls to `createCachedQueryAndUpdate` even with the same type will return two different caches.
 *
 * No arguments needed. Instead, only the generic types are needed.
 *
 * @returns {(QueryAndUpdate<R, E>) => void} queryAndUpdate call
 */
export const createCachedQueryAndUpdate = <R, E>() => {
  const cache = new ResponseCache<R>();
  const calls: Calls<R, E> = {
    query_and_update: {
      onLoadListeners: [],
      onErrorListeners: [],
    },
    query: {
      onLoadListeners: [],
      onErrorListeners: [],
    },
    update: {
      onLoadListeners: [],
      onErrorListeners: [],
    },
  };
  return async ({
    request,
    onLoad,
    onError,
    strategy = "query_and_update",
    logMessage,
    identityType = "authorized",
    resetCache,
  }: QueryAndUpdate<R, E>): Promise<void> => {
    // We only return cache data if the fetch is not forced
    if (!resetCache) {
      const certifiedData = cache.getCertifiedData();
      // Return certified data if available
      if (certifiedData !== undefined) {
        onLoad({ certified: true, response: certifiedData });
        cachingCallsStore.increment();
        return;
      }
      // For query strategy return uncertified data if available
      const uncertifiedData = cache.getUncertifiedData();
      if (uncertifiedData !== undefined && strategy !== "update") {
        onLoad({ certified: false, response: uncertifiedData });
        cachingCallsStore.increment();
        if (strategy === "query") {
          return;
        }
      }
    }

    const strategyCalls = calls[strategy];

    strategyCalls.onLoadListeners.push(onLoad);
    if (onError !== undefined) {
      strategyCalls.onErrorListeners.push(onError);
    }

    if (strategyCalls.onLoadListeners.length === 1) {
      await queryAndUpdate({
        request,
        onLoad: ({
          certified,
          response,
        }: {
          certified: boolean;
          response: R;
        }) => {
          cache.set({ certified, response });
          strategyCalls.onLoadListeners.forEach((listener) =>
            listener({ certified, response })
          );
          // Reset the listeners when we get the response from the "most certified" call of the strategy
          if (
            (strategy === "query_and_update" && certified) ||
            strategy === "query" ||
            (strategy === "update" && certified)
          ) {
            strategyCalls.onLoadListeners = [];
            strategyCalls.onErrorListeners = [];
          }
        },
        onError: ({ error, certified }: { certified: boolean; error: E }) => {
          cache.reset(certified);
          strategyCalls.onErrorListeners.forEach((listener) =>
            listener({ error, certified })
          );
          // Reset the listeners when we get the response from the "most certified" call of the strategy
          if (
            (strategy === "query_and_update" && certified) ||
            strategy === "query" ||
            (strategy === "update" && certified)
          ) {
            strategyCalls.onLoadListeners = [];
            strategyCalls.onErrorListeners = [];
          }
        },
        strategy,
        logMessage,
        identityType,
      });
    }
  };
};

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
  const log = ({ postfix }: { postfix: string }) => {
    if (strategy !== "query_and_update") {
      return;
    }
    logPrefix = logPrefix ?? `[${lastIndex++}] ${logMessage ?? ""}`;
    logWithTimestamp(`${logPrefix} calls${postfix}`);
  };

  const identity: Identity =
    identityType === "anonymous"
      ? getAnonymousIdentity()
      : identityType === "current"
      ? getCurrentIdentity()
      : await getAuthenticatedIdentity();

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
