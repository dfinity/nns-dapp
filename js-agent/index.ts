import AuthApi from "./src/AuthApi";
import GovernanceApi from "./src/GovernanceApi";
import HardwareWalletApi from "./src/HardwareWalletApi";
import LedgerApi from "./src/LedgerApi";
import { Identity, SignIdentity } from "@dfinity/agent";
import { principalToAccountIdentifier } from "./src/canisters/converter";

window["AuthApi"] = AuthApi;
window["GovernanceApi"] = GovernanceApi;
window["HardwareWalletApi"] = HardwareWalletApi;
window["LedgerApi"] = LedgerApi;

// This hack is because Dart interop doesn't yet understand bigint
window["Serializer"] = function(object: Object): String {
    return JSON.stringify(object, (_key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    );
}

// This hack is because Dart interop doesn't yet understand bigint
window["createBigInt"] = function(bigIntString: string): BigInt {
    return BigInt(bigIntString)
}

// This hack is because Dart interop doesn't yet understand bigint
window["createLedgerApi"] = function(host: string, identity: SignIdentity): LedgerApi {
    return new LedgerApi(host, identity);
}

window["createGovernanceApi"] = function(host: string, identity: SignIdentity): GovernanceApi {
    return new GovernanceApi(host, identity);
}

window["getAccountIdentifier"] = (identity: Identity) : string => {
    return principalToAccountIdentifier(identity.getPrincipal());
}
