import { SECONDS_IN_MINUTE } from "$lib/constants/constants";
import { cachingCallsStore } from "$lib/stores/caching-calling.store";
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

type CachedData<R> = QueryAndUpdateResponseData<R> & {
  timestampMilliseconds: number;
};
class Cache<T> {
  private certifiedData: CachedData<T> | undefined;
  private uncertifiedData: CachedData<T> | undefined;

  constructor(private cacheExpirationMilliseconds: number) {}

  getCertifiedData(): T | undefined {
    const diff = Date.now() - (this.certifiedData?.timestampMilliseconds ?? 0);
    if (diff > this.cacheExpirationMilliseconds) {
      this.certifiedData = undefined;
      return;
    }
    return this.certifiedData?.response;
  }

  getUncertifiedData(): T | undefined {
    const diff =
      Date.now() - (this.uncertifiedData?.timestampMilliseconds ?? 0);
    if (diff > this.cacheExpirationMilliseconds) {
      this.uncertifiedData = undefined;
      return;
    }
    return this.uncertifiedData?.response;
  }

  set(value: QueryAndUpdateResponseData<T>): void {
    const data = {
      ...value,
      timestampMilliseconds: Date.now(),
    };
    if (value.certified) {
      this.certifiedData = data;
    } else {
      this.uncertifiedData = data;
    }
  }

  reset(certified: boolean): void {
    if (certified) {
      this.certifiedData = undefined;
    }
    this.uncertifiedData = undefined;
  }
}

let lastIndex = 0;

type QueryAndUpdate<R, E> = {
  request: (options: { certified: boolean; identity: Identity }) => Promise<R>;
  onLoad: QueryAndUpdateOnResponse<R>;
  logMessage?: string;
  onError?: QueryAndUpdateOnError<E>;
  strategy?: QueryAndUpdateStrategy;
  identityType?: QueryAndUpdateIdentity;
  forceFetch?: boolean;
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
  const FIVE_MINUTES = SECONDS_IN_MINUTE * 1000 * 5;
  const cache = new Cache<R>(FIVE_MINUTES);
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
    forceFetch,
  }: QueryAndUpdate<R, E>): Promise<void> => {
    // We only return cache data if the fetch is not forced
    if (!forceFetch) {
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
        onLoad: (responseData: { certified: boolean; response: R }) => {
          cache.set(responseData);
          strategyCalls.onLoadListeners.forEach((listener) =>
            listener(responseData)
          );
          strategyCalls.onLoadListeners = [];
          strategyCalls.onErrorListeners = [];
        },
        onError: ({ error, certified }: { certified: boolean; error: E }) => {
          cache.reset(certified);
          strategyCalls.onErrorListeners.forEach((listener) =>
            listener({ error, certified })
          );
          strategyCalls.onLoadListeners = [];
          strategyCalls.onErrorListeners = [];
        },
        strategy,
        logMessage,
        identityType,
      });
    }
  };
};

// OPTION 3: Global cache used in all queryAndUpdate calls
//
// The main problem with this is that the "cacheKey" used in queryAndUpdate is not related to the type in the cache.
// Also that the cache is typed with casting or not typed at all.
//
// OPTION 3.1 Typed cache.
//
// This would mean to have to cast when writing to the cache and reading from it.
// enum CacheKey {
//   SnsSwapCommitments = "SnsSwapCommitment",
// }
// type GlobalCache = {
//   [CacheKey.SnsSwapCommitments]: SnsSwapCommitment[] | undefined;
// };
// const globalCache: GlobalCache = {
//   [CacheKey.SnsSwapCommitments]: undefined,
// };
// OPTION 3.2 Un-typed cache.
//
// type Cache: any: = {};
//

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
