import { Identity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService from "./canisters/governance/service";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/service";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService from "./canisters/ledgerView/service";
import * as webauthn from "./webauthn";
import { WebAuthnIdentity } from "./webauthn";

export default class WalletApi {
    public createAuthenticationIdentity(): Promise<WebAuthnIdentity> {
        return webauthn.WebAuthnIdentity.create()
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
