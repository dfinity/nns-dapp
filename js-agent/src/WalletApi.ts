import { Identity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService from "./canisters/governance/service";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/service";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService from "./canisters/ledgerView/service";
import * as webauthn from "./auth/webauthn";
import { WebAuthnIdentity } from "./auth/webauthn";
import authClient from "./auth/authClient";
import GOVERNANCE_CANISTER_ID from "./canisters/governance/canisterId";
import LEDGER_CANISTER_ID from "./canisters/governance/canisterId";
import LEDGER_VIEW_CANISTER_ID from "./canisters/governance/canisterId";
import { DelegationIdentity } from "@dfinity/authentication";

const canisterIds = [
    GOVERNANCE_CANISTER_ID,
    LEDGER_CANISTER_ID,
    LEDGER_VIEW_CANISTER_ID
];

export default class WalletApi {
    public async loginWithIdentityProvider(returnUrl: string) : Promise<void> {
        await authClient.loginWithRedirect({
            redirectUri: returnUrl,
            scope: canisterIds
        });
    }

    public createDelegationIdentity(accessToken: string) : DelegationIdentity {
        return authClient.createDelegationIdentity(accessToken);
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
