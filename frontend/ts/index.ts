/**
 * Methods exposed globally to be invoked by Dart code.
 */
import AuthApi from "./src/AuthApi";
import HardwareWalletApi from "./src/HardwareWalletApi";
import { SignIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { LedgerIdentity } from "./src/ledger/identity";
import { principalToAccountIdentifier } from "./src/canisters/converter";
import ServiceApi from "./src/ServiceApi";
import { toHexString } from "./src/utils";

// Represent Principals as strings rather than as byte arrays when serializing to JSON strings
Principal.prototype.toJSON = function () {
  return this.toString();
};

// @ts-ignore
window["createAuthApi"] = (onLoggedOut: () => void): Promise<AuthApi> => {
  return AuthApi.create(onLoggedOut);
};

// @ts-ignore
window["createServiceApi"] = (identity: SignIdentity): Promise<ServiceApi> => {
  return ServiceApi.create(identity);
};

// @ts-ignore
window["createHardwareWalletApi"] = (
  identity: LedgerIdentity
): Promise<HardwareWalletApi> => {
  return HardwareWalletApi.create(identity);
};

// This is needed because Dart interop doesn't yet understand bigint
// @ts-ignore
// eslint-disable-next-line
window["Serializer"] = function (object: any): string {
  return JSON.stringify(
    object,
    (_key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
  );
};

// This is needed because Dart interop doesn't yet understand bigint
// @ts-ignore
window["createBigInt"] = function (bigIntString: string): BigInt {
  return BigInt(bigIntString);
};

// This is needed because Dart interop doesn't yet understand bigint
// @ts-ignore
window["convertBigIntToString"] = function (bigInt: bigint): string {
  return bigInt.toString();
};

// @ts-ignore
window["getAccountIdentifier"] = (identity: SignIdentity): string => {
  return principalToAccountIdentifier(identity.getPrincipal());
};

// @ts-ignore
window["getPublicKey"] = (identity: SignIdentity): string => {
  return toHexString(identity.getPublicKey().toDer());
};
