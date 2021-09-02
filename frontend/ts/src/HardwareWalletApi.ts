import { LedgerIdentity } from "./ledger/identity";
import ledgerBuilder from "./canisters/ledger/builder";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService, { EmptyResponse } from "./canisters/governance/model";
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
import { executeWithLogging } from "./errorLogger";

export default class HardwareWalletApi {
  private readonly identity: LedgerIdentity;
  private readonly accountIdentifier: AccountIdentifier;
  private readonly ledgerService: LedgerService;
  private readonly governanceService: GovernanceService;
  /**
   * The anonymous governance service is used for fetching data from the
   * governance canister that doesn't need the ledger wallet's authentication.
   */
  private readonly anonymousGovernanceService: GovernanceService;

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
    const anonymousGovernanceService = governanceBuilder(
      anonymousAgent,
      new AnonymousIdentity()
    );

    const governanceService = governanceBuilder(ledgerAgent, ledgerIdentity);

    return new HardwareWalletApi(
      ledgerIdentity,
      ledgerService,
      anonymousGovernanceService,
      governanceService
    );
  };

  private constructor(
    ledgerIdentity: LedgerIdentity,
    ledgerService: LedgerService,
    anonymousGovernanceService: GovernanceService,
    governanceService: GovernanceService
  ) {
    this.identity = ledgerIdentity;
    this.accountIdentifier = principalToAccountIdentifier(
      ledgerIdentity.getPrincipal()
    );
    this.ledgerService = ledgerService;
    this.anonymousGovernanceService = anonymousGovernanceService;
    this.governanceService = governanceService;
  }

  public sendICPTs = async (
    fromAccount: AccountIdentifier,
    request: SendICPTsRequest
  ): Promise<BlockHeight> => {
    if (fromAccount !== this.accountIdentifier) {
      throw new Error("'From Account' does not match the hardware wallet");
    }

    // The Ledger app requires a memo to be explicitly set.
    if (!request.memo) {
      request.memo = BigInt(0);
    }

    return await this.ledgerService.sendICPTs(request);
  };

  public createNeuron = async (amount: E8s): Promise<string> => {
    // Flag that an upcoming stake neuron transaction is coming to distinguish
    // it from a "send ICP" transaction on the device.
    this.identity.flagUpcomingStakeNeuron();

    const neuronId = await createNeuronImpl(
      this.identity.getPrincipal(),
      this.ledgerService,
      this.anonymousGovernanceService,
      {
        stake: amount,
      }
    );

    // Returning as string for dart compatibility.
    return neuronId.toString();
  };

  public addHotKey = async (
    neuronId: NeuronId,
    principal: string
  ): Promise<EmptyResponse> => {
    return await executeWithLogging(() =>
      this.governanceService.addHotKey({
        neuronId: neuronId,
        principal: principal,
      })
    );
  };
}
