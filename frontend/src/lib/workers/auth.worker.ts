import type { PostMessage } from "$lib/types/post-messages";
import { createAuthClient } from "$lib/utils/auth.utils";
import {
  IdbStorage,
  KEY_STORAGE_DELEGATION,
  type AuthClient,
} from "@dfinity/auth-client";
import { DelegationChain, isDelegationValid } from "@dfinity/identity";

onmessage = ({ data }: MessageEvent<PostMessage<never>>) => {
  const { msg } = data;

  switch (msg) {
    case "nnsStartIdleTimer":
      startIdleTimer();
      return;
    case "nnsStopIdleTimer":
      stopIdleTimer();
      return;
  }
};

let timer: NodeJS.Timeout | undefined = undefined;

/**
 * The timer is executed only if user has signed in
 */
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
  const [auth, chain] = await Promise.all([
    checkAuthentication(),
    checkDelegationChain(),
  ]);

  // Both identity and delegation are alright, so all good
  if (auth && chain.valid && chain.delegation !== null) {
    emitExpirationTime(chain.delegation);
    return;
  }

  logout();
};

/**
 * If user is not authenticated - i.e. no identity or anonymous and there is no valid delegation chain, then identity is not valid
 *
 * @returns true if authenticated
 */
const checkAuthentication = async (): Promise<boolean> => {
  const authClient: AuthClient = await createAuthClient();
  return authClient.isAuthenticated();
};

const delegation = async (): Promise<DelegationChain | null> => {
  const idbStorage: IdbStorage = new IdbStorage();
  const delegationChain: string | null = await idbStorage.get(
    KEY_STORAGE_DELEGATION
  );

  if (delegationChain === null) {
    return null;
  }

  return DelegationChain.fromJSON(delegationChain);
};

/**
 * If there is no delegation or if not valid, then delegation is not valid
 *
 * @returns true if delegation is valid
 */
const checkDelegationChain = async (): Promise<{
  valid: boolean;
  delegation: DelegationChain | null;
}> => {
  const delegationChain = await delegation();

  return {
    valid: delegationChain !== null && isDelegationValid(delegationChain),
    delegation: delegationChain,
  };
};

// We do the logout on the client side because we reload the window to reload stores afterwards
const logout = () => {
  // Clear timer to not emit sign-out multiple times
  stopIdleTimer();

  postMessage({ msg: "nnsSignOut" });
};

const emitExpirationTime = (delegation: DelegationChain) => {
  const expirationTime: bigint | undefined =
    delegation.delegations[0]?.delegation.expiration;

  // That would be unexpected here because the delegation has just been tested and is valid
  if (expirationTime === undefined) {
    return;
  }

  // 1_000_000 as NANO_SECONDS_IN_MILLISECOND. Constant not imported to not break prod build.
  const authRemainingTime =
    new Date(Number(expirationTime / BigInt(1_000_000))).getTime() - Date.now();

  postMessage({
    msg: "nnsDelegationRemainingTime",
    data: {
      authRemainingTime,
    },
  });
};
