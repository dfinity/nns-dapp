import { Identity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import GoveranceService from "./canisters/governance/service";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/service";
import * as webauthn from "./webauthn";
import { WebAuthnIdentity } from "./webauthn";

export default class WalletApi {
    public createAuthenticationIdentity(): Promise<WebAuthnIdentity> {
        return webauthn.WebAuthnIdentity.create()
    }

    public buildGovernanceService(host: string, identity: Identity): GoveranceService {
        return governanceBuilder(host, identity);
    }

    public buildLedgerService(host: string, identity: Identity): LedgerService {
        return ledgerBuilder(host, identity);
    }
}
