import AuthApi from "./src/AuthApi";
import GovernanceApi from "./src/GovernanceApi";
import LedgerApi from "./src/LedgerApi";

window["AuthApi"] = AuthApi;
window["GovernanceApi"] = GovernanceApi;
window["LedgerApi"] = LedgerApi;

// This hack is because Dart interop doesn't yet understand bigint
window["Serializer"] = function(object: Object): String {
    return JSON.stringify(object, (_key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    );
}
