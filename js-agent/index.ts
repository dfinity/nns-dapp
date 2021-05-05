import AuthApi from "./src/AuthApi";
import HardwareWalletApi from "./src/HardwareWalletApi";
import ServiceApi from "./src/ServiceApi";
import { SignIdentity } from "@dfinity/agent";
import { principalToAccountIdentifier } from "./src/canisters/converter";

window["AuthApi"] = AuthApi;
window["ServiceApi"] = ServiceApi;
window["HardwareWalletApi"] = HardwareWalletApi;

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

window["createServiceApi"] = function(host: string, identity: SignIdentity): ServiceApi {
    return new ServiceApi(host, identity);
}

window["getAccountIdentifier"] = (identity: SignIdentity) : string => {
    return principalToAccountIdentifier(identity.getPrincipal());
}

window["getPublicKey"] = (identity: SignIdentity) : string => {
    return identity.getPublicKey().toDer().toString('hex');
}
