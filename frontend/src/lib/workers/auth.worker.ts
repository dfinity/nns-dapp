import { isDelegationValid } from "@dfinity/authentication";
import { DelegationChain } from "@dfinity/identity";

let timer: NodeJS.Timeout | undefined = undefined;

export const startIdleTimer = () =>
  (timer = setInterval(async () => await onIdleSignOut(), 1000));

export const stopIdleTimer = () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

const onIdleSignOut = async () => {
  const delegationChain = await getDelegationChain();

  if (delegationChain === undefined) {
    return;
  }

  if (isDelegationValid(DelegationChain.fromJSON(delegationChain))) {
    return;
  }

  // Clear timer to not emit sign-out multiple times
  stopIdleTimer();

  postMessage({ msg: "nnsSignOut" });
};

const getDelegationChain = async (): Promise<string | undefined> => {
  const customStore = createStore("auth-client-db", "ic-keyval");
  return get("delegation", customStore);
};

// Source idb-keyval: https://github.com/jakearchibald/idb-keyval

type UseStore = <T>(
  txMode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => T | PromiseLike<T>
) => Promise<T>;

function promisifyRequest<T = undefined>(
  request: IDBRequest<T> | IDBTransaction
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // @ts-ignore - file size hacks
    request.oncomplete = request.onsuccess = () => resolve(request.result);
    // @ts-ignore - file size hacks
    request.onabort = request.onerror = () => reject(request.error);
  });
}

function createStore(dbName: string, storeName: string): UseStore {
  const request = indexedDB.open(dbName);
  request.onupgradeneeded = () => request.result.createObjectStore(storeName);
  const dbp = promisifyRequest(request);

  return (txMode, callback) =>
    dbp.then((db) =>
      callback(db.transaction(storeName, txMode).objectStore(storeName))
    );
}

function get<T>(
  key: IDBValidKey,
  customStore: UseStore
): Promise<T | undefined> {
  return customStore("readonly", (store) => promisifyRequest(store.get(key)));
}
