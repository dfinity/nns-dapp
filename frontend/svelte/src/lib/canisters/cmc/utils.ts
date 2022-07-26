import type { Principal } from "@dfinity/principal";

export const principalToSubAccount = (principal: Principal): Uint8Array => {
  const bytes = principal.toUint8Array();
  const subAccount = new Uint8Array(32);
  subAccount[0] = bytes.length;
  subAccount.set(bytes, 1);
  return subAccount;
};
