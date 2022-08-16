import { isDelegationValid } from "@dfinity/authentication";
import { DelegationChain } from "@dfinity/identity";
import { getIdbAuthKey } from "../utils/auth.utils";

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

const getDelegationChain = async (): Promise<string | undefined> =>
  getIdbAuthKey("delegation");
