import { LedgerIdentity } from "./ledger/identity";
import ledgerBuilder from "./canisters/ledger/builder";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService from "./canisters/governance/model";
import LedgerService, { SendICPTsRequest } from "./canisters/ledger/model";
import {
  AccountIdentifier,
  BlockHeight,
  E8s,
  NeuronId,
} from "./canisters/common/types";
import { AnonymousIdentity, HttpAgent } from "@dfinity/agent";
import { principalToAccountIdentifier } from "./canisters/converter";
import { HOST } from "./canisters/constants";
import { FETCH_ROOT_KEY } from "./config.json";
import createNeuronImpl from "./canisters/createNeuron";

export default class HardwareWalletApi {
  private readonly identity: LedgerIdentity;
  private readonly accountIdentifier: AccountIdentifier;
  private readonly ledgerService: LedgerService;
  private readonly governanceService: GovernanceService;

  public static create = async (
    ledgerIdentity: LedgerIdentity
  ): Promise<HardwareWalletApi> => {
    const anonymousAgent = new HttpAgent({
      host: HOST,
      identity: new AnonymousIdentity(),
    });

    if (FETCH_ROOT_KEY) {
      await anonymousAgent.fetchRootKey();
    }

    const ledgerAgent = new HttpAgent({
      host: HOST,
      identity: ledgerIdentity,
    });

    if (FETCH_ROOT_KEY) {
      await ledgerAgent.fetchRootKey();
    }

    const ledgerService = ledgerBuilder(ledgerAgent);
    const governanceService = governanceBuilder(
      anonymousAgent,
      new AnonymousIdentity()
    );

    return new HardwareWalletApi(
      ledgerIdentity,
      ledgerService,
      governanceService
    );
  };

  private constructor(
    ledgerIdentity: LedgerIdentity,
    ledgerService: LedgerService,
    governanceService: GovernanceService
  ) {
    this.identity = ledgerIdentity;
    this.accountIdentifier = principalToAccountIdentifier(
      ledgerIdentity.getPrincipal()
    );
    this.ledgerService = ledgerService;
    this.governanceService = governanceService;
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
    // Flag that an upcoming stake neuron transaction is coming to distinguish
    // it from a "send ICP" transaction on the device.
    this.identity.flagUpcomingStakeNeuron();

    return createNeuronImpl(
      this.identity.getPrincipal(),
      this.ledgerService,
      this.governanceService,
      {
        stake: amount,
      }
    );
  };
}
