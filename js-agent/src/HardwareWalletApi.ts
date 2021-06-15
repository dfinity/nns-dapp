import { LedgerIdentity } from "./ledger/identity";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, { SendICPTsRequest } from "./canisters/ledger/model";
import { AccountIdentifier, BlockHeight } from "./canisters/common/types";
import { HttpAgent } from "@dfinity/agent";
import { principalToAccountIdentifier } from "./canisters/converter";
import { HOST } from "./canisters/constants";
import { FETCH_ROOT_KEY } from "./config.json";
import { executeWithLogging } from "./errorLogger";

export default class HardwareWalletApi {
    private readonly identity: LedgerIdentity;
    private readonly accountIdentifier: AccountIdentifier;
    private readonly ledgerService: LedgerService;

    public static create = async (identity: LedgerIdentity) : Promise<HardwareWalletApi> => {
        const agent = new HttpAgent({
            host: HOST,
            identity
        });

        if (FETCH_ROOT_KEY) {
            await agent.fetchRootKey();
        }

        return new HardwareWalletApi(agent, identity);
    }

    private constructor(agent: HttpAgent, identity: LedgerIdentity) {
        this.identity = identity;
        this.accountIdentifier = principalToAccountIdentifier(identity.getPrincipal());
        this.ledgerService = ledgerBuilder(agent, identity);
    }

    public sendICPTs = async (fromAccount: AccountIdentifier, request: SendICPTsRequest) : Promise<BlockHeight> => {
        if (fromAccount !== this.accountIdentifier)
            throw new Error("'From Account' does not match the hardware wallet");

        return await executeWithLogging(() => this.ledgerService.sendICPTs(request));
    }

    public showAddressAndPubKeyOnDevice = () : Promise<void> => {
        return executeWithLogging(this.identity.showAddressAndPubKeyOnDevice);
    }
}
