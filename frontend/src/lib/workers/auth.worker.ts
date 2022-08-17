import { IdbStorage, type AuthClient } from "@dfinity/auth-client";
import { isDelegationValid } from "@dfinity/authentication";
import { DelegationChain } from "@dfinity/identity";
import { createAuthClient } from "../utils/auth.utils";

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
  const [auth, delegation] = await Promise.all([
    checkAuthentication(),
    checkDelegationChain(),
  ]);

  // Both identity and delegation are alright, so all good
  if (auth && delegation) {
    return;
  }

  logout();
};

/**
 * If user is no authenticated - i.e. no identity or anonymous and there is no delegation chain, then identity is not valid
 *
 * @returns true if authenticated
 */
const checkAuthentication = async (): Promise<boolean> => {
  const authClient: AuthClient = await createAuthClient();
  return authClient.isAuthenticated();
};

/**
 * If there is no delegation or if not valid, then delegation is not valid
 *
 * @returns true if delegation is valid
 */
const checkDelegationChain = async (): Promise<boolean> => {
  const idbStorage: IdbStorage = new IdbStorage();
  const delegationChain: string | null = await idbStorage.get("delegation");

  return (
    delegationChain !== null &&
    isDelegationValid(DelegationChain.fromJSON(delegationChain))
  );
};

// We do the logout on the client side because we reload the window to reload stores afterwards
const logout = () => {
  // Clear timer to not emit sign-out multiple times
  stopIdleTimer();

  postMessage({ msg: "nnsSignOut" });
};
