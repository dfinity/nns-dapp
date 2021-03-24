import { Identity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService from "./canisters/governance/service";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/service";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService from "./canisters/ledgerView/rawService";
import * as webauthn from "./auth/webauthn";
import { WebAuthnIdentity } from "./auth/webauthn";
import authClient from "./auth/authClient";
import GOVERNANCE_CANISTER_ID from "./canisters/governance/canisterId";
import LEDGER_CANISTER_ID from "./canisters/governance/canisterId";
import LEDGER_VIEW_CANISTER_ID from "./canisters/governance/canisterId";
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/authentication";
import testCalls from "./testCalls";

const canisterIds = [
    GOVERNANCE_CANISTER_ID,
    LEDGER_CANISTER_ID,
    LEDGER_VIEW_CANISTER_ID
];

export default class WalletApi {

    public async testCalls() {
        testCalls(this);
    }

    public createKey() : string {
        return JSON.stringify(authClient.createKey().toJSON());
    }

    public async loginWithIdentityProvider(key: string, returnUrl: string) : Promise<void> {
        await authClient.loginWithRedirect(
            Ed25519KeyIdentity.fromJSON(key),
            {
                redirectUri: returnUrl,
                scope: canisterIds
            });
    }

    public createDelegationIdentity(key: string, accessToken: string) : DelegationIdentity {
        return authClient.createDelegationIdentity(Ed25519KeyIdentity.fromJSON(key), accessToken);
    }

    public createAuthenticationIdentity(): Promise<WebAuthnIdentity> {
        return webauthn.WebAuthnIdentity.create();
    }

    public buildGovernanceService(host: string, identity: Identity): GovernanceService {
        return governanceBuilder(host, identity);
    }

    public buildLedgerService(host: string, identity: Identity): LedgerService {
        return ledgerBuilder(host, identity);
    }

    public buildLedgerViewService(host: string, identity: Identity): LedgerViewService {
        return ledgerViewBuilder(host, identity);
    }
}
