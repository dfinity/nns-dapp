import { LedgerIdentity } from "@dfinity/identity-ledgerhq";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, { SendICPTsRequest } from "./canisters/ledger/model";
import { AccountIdentifier, BlockHeight } from "./canisters/common/types";
import { HttpAgent } from "@dfinity/agent";
import { principalToAccountIdentifier } from "./canisters/converter";

export default class HardwareWalletApi {
    private readonly identity: LedgerIdentity;
    private readonly accountIdentifier: AccountIdentifier;
    private readonly ledgerService: LedgerService;

    constructor(identity: LedgerIdentity) {
        const agent = new HttpAgent({
            identity
        });
        this.identity = identity;
        this.accountIdentifier = principalToAccountIdentifier(identity.getPrincipal());
        this.ledgerService = ledgerBuilder(agent, identity);
    }

    public sendICPTs = async (fromAccount: AccountIdentifier, request: SendICPTsRequest) : Promise<BlockHeight> => {
        if (fromAccount !== this.accountIdentifier)
            throw new Error("'From Account' does not match the hardware wallet");

        return await this.ledgerService.sendICPTs(request);
    }

    public showAddressAndPubKeyOnDevice = () : Promise<void> => {
        return this.identity.showAddressAndPubKeyOnDevice();
    }
}
