import * as webauthn from "./auth/webauthn";
import { WebAuthnIdentity } from "./auth/webauthn";
import authClient from "./auth/authClient";
import GOVERNANCE_CANISTER_ID from "./canisters/governance/canisterId";
import LEDGER_CANISTER_ID from "./canisters/ledger/canisterId";
import LEDGER_VIEW_CANISTER_ID from "./canisters/ledgerView/canisterId";
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity";

const canisterIds = [
    GOVERNANCE_CANISTER_ID,
    LEDGER_CANISTER_ID,
    LEDGER_VIEW_CANISTER_ID
];

export default class AuthApi {

    public createKey = () : string => {
        return JSON.stringify(authClient.createKey().toJSON());
    }

    public loginWithIdentityProvider = async (key: string, returnUrl: string) : Promise<void> => {
        await authClient.loginWithRedirect(
            Ed25519KeyIdentity.fromJSON(key),
            {
                redirectUri: returnUrl,
                scope: canisterIds
            });
    }

    public createDelegationIdentity = (key: string, accessToken: string) : DelegationIdentity => {
        return authClient.createDelegationIdentity(Ed25519KeyIdentity.fromJSON(key), accessToken);
    }

    public createAuthenticationIdentity = (): Promise<WebAuthnIdentity> => {
        return webauthn.WebAuthnIdentity.create();
    }
}
