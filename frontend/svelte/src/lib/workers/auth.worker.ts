import { isDelegationValid } from "@dfinity/authentication";
import { DelegationChain } from "@dfinity/identity";
import type { LocalStorageAuth } from "../types/auth";

let timer: NodeJS.Timeout | undefined = undefined;

export const startIdleTimer = (data?: LocalStorageAuth) =>
  (timer = setInterval(() => onIdleSignOut(data), 1000));

export const stopIdleTimer = () => {
  if (!timer) {
    return;
  }

  clearInterval(timer);
  timer = undefined;
};

const onIdleSignOut = (data?: LocalStorageAuth) => {
  if (!data) {
    return;
  }

  const { delegationChain } = data;

  if (delegationChain === null) {
    return;
  }

  if (isDelegationValid(DelegationChain.fromJSON(delegationChain))) {
    return;
  }

  // Clear timer to not emit sign-out multiple times
  stopIdleTimer();

  postMessage({ msg: "nnsSignOut" });
};
