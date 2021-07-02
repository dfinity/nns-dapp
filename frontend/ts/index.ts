import AuthApi from "./src/AuthApi";
import HardwareWalletApi from "./src/HardwareWalletApi";
import { SignIdentity } from "@dfinity/agent";
import { LedgerIdentity } from "./src/ledger/identity";
import { principalToAccountIdentifier } from "./src/canisters/converter";
import ServiceApi from "./src/ServiceApi";

// @ts-ignore
window["createAuthApi"] = (onLoggedOut: () => void) : Promise<AuthApi> => {
    return AuthApi.create(onLoggedOut);
}

// @ts-ignore
window["createServiceApi"] = (identity: SignIdentity) : Promise<ServiceApi> => {
    return ServiceApi.create(identity);
}

// @ts-ignore
window["createHardwareWalletApi"] = (identity: LedgerIdentity) : Promise<HardwareWalletApi> => {
    return HardwareWalletApi.create(identity);
}

// This hack is because Dart interop doesn't yet understand bigint
// @ts-ignore
window["Serializer"] = function(object: Object): String {
    return JSON.stringify(object, (_key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    );
}

// This hack is because Dart interop doesn't yet understand bigint
// @ts-ignore
window["createBigInt"] = function(bigIntString: string): BigInt {
    return BigInt(bigIntString)
}

// This hack is because Dart interop doesn't yet understand bigint
// @ts-ignore
window["convertBigIntToString"] = function(bigInt: bigint): string {
    return bigInt.toString();
}

// @ts-ignore
window["getAccountIdentifier"] = (identity: SignIdentity) : string => {
    return principalToAccountIdentifier(identity.getPrincipal());
}

// @ts-ignore
window["getPublicKey"] = (identity: SignIdentity) : string => {
    return identity.getPublicKey().toDer().toString('hex');
}
