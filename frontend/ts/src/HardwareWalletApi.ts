import { LedgerIdentity } from "./ledger/identity";
import ledgerBuilder from "./canisters/ledger/builder";
import nnsUiBuilder from "./canisters/nnsUI/builder";
import NnsUiService from "./canisters/nnsUI/model";
import LedgerService, { SendICPTsRequest } from "./canisters/ledger/model";
import {
  AccountIdentifier,
  BlockHeight,
  E8s,
  NeuronId,
} from "./canisters/common/types";
import { HttpAgent, SignIdentity } from "@dfinity/agent";
import { principalToAccountIdentifier } from "./canisters/converter";
import { HOST } from "./canisters/constants";
import { FETCH_ROOT_KEY } from "./config.json";
import { executeWithLogging } from "./errorLogger";
import createNeuronImpl from "./canisters/createNeuron";

export default class HardwareWalletApi {
  private readonly identity: LedgerIdentity;
  private readonly accountIdentifier: AccountIdentifier;
  private readonly ledgerService: LedgerService;
  private readonly nnsUiService: NnsUiService;

  public static create = async (
    ledgerIdentity: LedgerIdentity,
    userIdentity: SignIdentity
  ): Promise<HardwareWalletApi> => {
    const userAgent = new HttpAgent({
      host: HOST,
      identity: userIdentity,
    });

    if (FETCH_ROOT_KEY) {
      await userAgent.fetchRootKey();
    }

    const ledgerAgent = new HttpAgent({
      host: HOST,
      identity: ledgerIdentity,
    });

    if (FETCH_ROOT_KEY) {
      await ledgerAgent.fetchRootKey();
    }

    return new HardwareWalletApi(ledgerIdentity, ledgerAgent, userAgent);
  };

  private constructor(
    ledgerIdentity: LedgerIdentity,
    ledgerAgent: HttpAgent,
    userAgent: HttpAgent
  ) {
    this.identity = ledgerIdentity;
    this.accountIdentifier = principalToAccountIdentifier(
      ledgerIdentity.getPrincipal()
    );
    this.ledgerService = ledgerBuilder(ledgerAgent);
    this.nnsUiService = nnsUiBuilder(userAgent);
  }

  public sendICPTs = async (
    fromAccount: AccountIdentifier,
    request: SendICPTsRequest
  ): Promise<BlockHeight> => {
    if (fromAccount !== this.accountIdentifier)
      throw new Error("'From Account' does not match the hardware wallet");

    return await this.ledgerService.sendICPTs(request);
  };

  public createNeuron = (amount: E8s): Promise<NeuronId> => {
    return executeWithLogging(() =>
      createNeuronImpl(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsUiService,
        {
          stake: amount,
        }
      )
    );
  };
}
