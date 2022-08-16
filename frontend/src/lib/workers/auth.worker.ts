import { isDelegationValid } from "@dfinity/authentication";
import { DelegationChain } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import { getIdbAuthKey } from "../utils/auth.utils";

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
  const [identity, delegation] = await Promise.all([checkIdentity(), checkDelegationChain()]);

  // Both identity and delegation are alright, so all good
  if (identity && delegation) {
    return;
  }

  logout();
};

/**
 * If there is no identity or if anonymous, then identity is not valid
 *
 * @returns true if identity is valid
 */
const checkIdentity = async (): Promise<boolean> => {
  const identity = await getIdentity();
  return identity !== undefined && !Principal.fromText(identity).isAnonymous();
};

/**
 * If there is no delegation or if not valid, then delegation is not valid
 *
 * @returns true if delegation is valid
 */
const checkDelegationChain = async (): Promise<boolean> => {
  const delegationChain = await getDelegationChain();

  return delegationChain !== undefined &&
      isDelegationValid(DelegationChain.fromJSON(delegationChain));
};

const logout = () => {
  // Clear timer to not emit sign-out multiple times
  stopIdleTimer();

  postMessage({ msg: "nnsSignOut" });
};

const getDelegationChain = async (): Promise<string | undefined> =>
  getIdbAuthKey("delegation");

const getIdentity = async (): Promise<string | undefined> =>
  getIdbAuthKey("identity");
