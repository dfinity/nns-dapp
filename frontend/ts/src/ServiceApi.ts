import {
  AnonymousIdentity,
  HttpAgent,
  Identity,
  SignIdentity,
} from "@dfinity/agent";
import { Option } from "./canisters/option";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService, {
  AddHotKeyRequest,
  DisburseRequest,
  DisburseResponse,
  DisburseToNeuronRequest,
  DisburseToNeuronResponse,
  EmptyResponse,
  FollowRequest,
  IncreaseDissolveDelayRequest,
  ListProposalsRequest,
  ListProposalsResponse,
  MakeMotionProposalRequest,
  MakeNetworkEconomicsProposalRequest,
  MakeProposalResponse,
  MakeRewardNodeProviderProposalRequest,
  MakeSetDefaultFolloweesProposalRequest,
  MergeMaturityRequest,
  MergeMaturityResponse,
  NeuronInfo,
  NeuronInfoForHw,
  RegisterVoteRequest,
  RemoveHotKeyRequest,
  SpawnRequest,
  SpawnResponse,
  SplitRequest,
  StartDissolvingRequest,
  StopDissolvingRequest,
} from "./canisters/governance/model";
import { ProposalInfo } from "./canisters/governance/model";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, {
  GetBalancesRequest,
  SendICPTsRequest,
} from "./canisters/ledger/model";
import nnsDappBuilder from "./canisters/nnsDapp/builder";
import NnsDappService, {
  AccountDetails,
  AttachCanisterRequest,
  AttachCanisterResult,
  CanisterDetails,
  CreateSubAccountResponse,
  DetachCanisterRequest,
  DetachCanisterResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  RegisterHardwareWalletRequest,
  RegisterHardwareWalletResponse,
  RenameSubAccountRequest,
  RenameSubAccountResponse,
} from "./canisters/nnsDapp/model";
import icManagementBuilder from "./canisters/icManagement/builder";
import ICManagementService, {
  CanisterDetailsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from "./canisters/icManagement/model";
import {
  createNeuronWithNnsDapp,
  CreateNeuronRequest,
} from "./canisters/createNeuron";
import topUpNeuronImpl, { TopUpNeuronRequest } from "./canisters/topUpNeuron";
import {
  createCanisterImpl,
  CreateCanisterRequest,
  CreateCanisterResponse,
} from "./canisters/createCanister";
import {
  AccountIdentifier,
  BlockHeight,
  CanisterIdString,
  E8s,
  NeuronId,
  PrincipalString,
} from "./canisters/common/types";
import { LedgerIdentity } from "./ledger/identity";
import { HOST } from "./canisters/constants";
import { executeWithLogging } from "./errorLogger";
import { FETCH_ROOT_KEY } from "./config.json";
import getAndRefreshNeurons from "./canisters/getAndRefreshNeurons";
import {
  topUpCanisterImpl,
  TopUpCanisterRequest,
  TopUpCanisterResponse,
} from "./canisters/topUpCanister";
import { principalToAccountIdentifier } from "./canisters/converter";
import { Principal } from "@dfinity/principal";

/**
 * An API for interacting with various canisters.
 */
export default class ServiceApi {
  private readonly ledgerService: LedgerService;
  private readonly nnsDappService: NnsDappService;
  private readonly governanceService: GovernanceService;
  private readonly icManagementService: ICManagementService;
  private readonly identity: SignIdentity;

  public static create = async (
    identity: SignIdentity
  ): Promise<ServiceApi> => {
    const agent = new HttpAgent({
      host: HOST,
      identity,
    });

    if (FETCH_ROOT_KEY) {
      await agent.fetchRootKey();
    }

    return new ServiceApi(agent, identity);
  };

  private constructor(agent: HttpAgent, identity: SignIdentity) {
    this.ledgerService = ledgerBuilder(agent);
    this.nnsDappService = nnsDappBuilder(agent);
    this.governanceService = governanceBuilder(agent, identity);
    this.icManagementService = icManagementBuilder(agent);
    this.identity = identity;
  }

  /* ACCOUNTS */

  public createSubAccount = (
    name: string
  ): Promise<CreateSubAccountResponse> => {
    return executeWithLogging(() => this.nnsDappService.createSubAccount(name));
  };

  public renameSubAccount = (
    request: RenameSubAccountRequest
  ): Promise<RenameSubAccountResponse> => {
    return executeWithLogging(() =>
      this.nnsDappService.renameSubAccount(request)
    );
  };

  public principalToAccountIdentifier(
    principal: PrincipalString
  ): AccountIdentifier {
    return principalToAccountIdentifier(Principal.fromText(principal));
  }

  public registerHardwareWallet = (
    name: string,
    identity: LedgerIdentity
  ): Promise<RegisterHardwareWalletResponse> => {
    const request: RegisterHardwareWalletRequest = {
      name,
      principal: identity.getPrincipal().toString(),
    };
    return executeWithLogging(() =>
      this.nnsDappService.registerHardwareWallet(request)
    );
  };

  public getAccount = async (): Promise<AccountDetails> => {
    const response = await executeWithLogging(() =>
      this.nnsDappService.getAccount()
    );
    if ("Ok" in response) {
      return response.Ok;
    } else {
      const accountIdentifier = await executeWithLogging(() =>
        this.nnsDappService.addAccount()
      );
      return {
        principal: this.identity.getPrincipal().toString(),
        accountIdentifier,
        subAccounts: [],
        hardwareWalletAccounts: [],
      };
    }
  };

  public getBalances = (
    request: GetBalancesRequest
  ): Promise<Record<AccountIdentifier, E8s>> => {
    return executeWithLogging(() => this.ledgerService.getBalances(request));
  };

  public getTransactions = (
    request: GetTransactionsRequest
  ): Promise<GetTransactionsResponse> => {
    return executeWithLogging(() =>
      this.nnsDappService.getTransactions(request)
    );
  };

  public sendICP = (
    identity: Identity,
    request: SendICPTsRequest
  ): Promise<BlockHeight> => {
    if (!request.memo) {
      // Always explicitly set the memo for compatibility with ledger wallet.
      request.memo = BigInt(0);
    }

    return executeWithLogging(async () =>
      (await ledgerService(identity)).sendICPTs(request)
    );
  };

  /* GOVERNANCE */

  public getNeuron = (neuronId: NeuronId): Promise<Option<NeuronInfo>> => {
    return executeWithLogging(() => this.governanceService.getNeuron(neuronId));
  };

  public getNeurons = (): Promise<Array<NeuronInfo>> => {
    return executeWithLogging(() =>
      getAndRefreshNeurons(this.governanceService, this.ledgerService)
    );
  };

  public getNeuronsForHw = (
    identity: Identity
  ): Promise<Array<NeuronInfoForHw>> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).getNeuronsForHW()
    );
  };

  public getPendingProposals = (): Promise<Array<ProposalInfo>> => {
    return executeWithLogging(() =>
      this.governanceService.getPendingProposals()
    );
  };

  public getProposalInfo = (
    proposalId: bigint
  ): Promise<Option<ProposalInfo>> => {
    return executeWithLogging(() =>
      this.governanceService.getProposalInfo(proposalId)
    );
  };

  public listProposals = (
    request: ListProposalsRequest
  ): Promise<ListProposalsResponse> => {
    return executeWithLogging(() =>
      this.governanceService.listProposals(request)
    );
  };

  public addHotKey = (request: AddHotKeyRequest): Promise<EmptyResponse> => {
    return executeWithLogging(() => this.governanceService.addHotKey(request));
  };

  public removeHotKey = (
    identity: Identity,
    request: RemoveHotKeyRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).removeHotKey(request)
    );
  };

  public startDissolving = (
    identity: Identity,
    request: StartDissolvingRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).startDissolving(request)
    );
  };

  public stopDissolving = (
    identity: Identity,
    request: StopDissolvingRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).stopDissolving(request)
    );
  };

  public increaseDissolveDelay = (
    identity: Identity,
    request: IncreaseDissolveDelayRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).increaseDissolveDelay(request)
    );
  };

  public follow = (request: FollowRequest): Promise<EmptyResponse> => {
    return executeWithLogging(() => this.governanceService.follow(request));
  };

  public registerVote = (
    request: RegisterVoteRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(() =>
      this.governanceService.registerVote(request)
    );
  };

  public spawn = (
    identity: Identity,
    request: SpawnRequest
  ): Promise<SpawnResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).spawn(request)
    );
  };

  public split = (request: SplitRequest): Promise<EmptyResponse> => {
    return executeWithLogging(() => this.governanceService.split(request));
  };

  public disburse = (
    identity: Identity,
    request: DisburseRequest
  ): Promise<DisburseResponse> => {
    return executeWithLogging(async () =>
      (await governanceService(identity)).disburse(request)
    );
  };

  public disburseToNeuron = (
    request: DisburseToNeuronRequest
  ): Promise<DisburseToNeuronResponse> => {
    return executeWithLogging(() =>
      this.governanceService.disburseToNeuron(request)
    );
  };

  public mergeMaturity = (
    request: MergeMaturityRequest
  ): Promise<MergeMaturityResponse> => {
    return executeWithLogging(() =>
      this.governanceService.mergeMaturity(request)
    );
  };

  public makeMotionProposal = (
    request: MakeMotionProposalRequest
  ): Promise<MakeProposalResponse> => {
    return executeWithLogging(() =>
      this.governanceService.makeMotionProposal(request)
    );
  };

  public makeNetworkEconomicsProposal = (
    request: MakeNetworkEconomicsProposalRequest
  ): Promise<MakeProposalResponse> => {
    return executeWithLogging(() =>
      this.governanceService.makeNetworkEconomicsProposal(request)
    );
  };

  public makeRewardNodeProviderProposal = (
    request: MakeRewardNodeProviderProposalRequest
  ): Promise<MakeProposalResponse> => {
    return executeWithLogging(() =>
      this.governanceService.makeRewardNodeProviderProposal(request)
    );
  };

  public makeSetDefaultFolloweesProposal = (
    request: MakeSetDefaultFolloweesProposalRequest
  ): Promise<MakeProposalResponse> => {
    return executeWithLogging(() =>
      this.governanceService.makeSetDefaultFolloweesProposal(request)
    );
  };

  public createNeuron = async (
    request: CreateNeuronRequest
  ): Promise<string> => {
    return await executeWithLogging(async () => {
      const neuronId = await createNeuronWithNnsDapp(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      );
      console.log("Received neuron id");
      console.log(neuronId);

      // NOTE: we're returning the neuron ID as a string for dart compatibility.
      return neuronId.toString();
    });
  };

  public topUpNeuron = (request: TopUpNeuronRequest): Promise<void> => {
    return executeWithLogging(() =>
      topUpNeuronImpl(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      )
    );
  };

  /* CANISTERS */

  public createCanister = (
    request: CreateCanisterRequest
  ): Promise<CreateCanisterResponse> => {
    return executeWithLogging(() =>
      createCanisterImpl(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      )
    );
  };

  public topUpCanister = (
    request: TopUpCanisterRequest
  ): Promise<TopUpCanisterResponse> => {
    return executeWithLogging(() =>
      topUpCanisterImpl(
        this.identity.getPrincipal(),
        this.ledgerService,
        this.nnsDappService,
        request
      )
    );
  };

  public attachCanister = (
    request: AttachCanisterRequest
  ): Promise<AttachCanisterResult> => {
    return executeWithLogging(() =>
      this.nnsDappService.attachCanister(request)
    );
  };

  public detachCanister = (
    request: DetachCanisterRequest
  ): Promise<DetachCanisterResponse> => {
    return executeWithLogging(() =>
      this.nnsDappService.detachCanister(request)
    );
  };

  public getCanisters = (): Promise<Array<CanisterDetails>> => {
    return executeWithLogging(() => this.nnsDappService.getCanisters());
  };

  public getCanisterDetails = (
    canisterId: CanisterIdString
  ): Promise<CanisterDetailsResponse> => {
    return executeWithLogging(() =>
      this.icManagementService.getCanisterDetails(canisterId)
    );
  };

  public updateCanisterSettings = (
    request: UpdateSettingsRequest
  ): Promise<UpdateSettingsResponse> => {
    return executeWithLogging(() =>
      this.icManagementService.updateSettings(request)
    );
  };

  public getIcpToCyclesConversionRate = (): Promise<bigint> => {
    return executeWithLogging(() =>
      this.nnsDappService.getIcpToCyclesConversionRate()
    );
  };

  /*
   * Gives the caller the specified amount of (fake) ICPs.
   * Should/can only be used on testnets.
   */
  public acquireICPTs = async (
    accountIdentifier: AccountIdentifier,
    e8s: E8s
  ): Promise<void> => {
    const agent = new HttpAgent({
      host: HOST,
      identity: new AnonymousIdentity(),
    });
    await agent.fetchRootKey();
    const anonLedgerService = ledgerBuilder(agent);
    const req = {
      to: accountIdentifier,
      amount: e8s,
    };
    await anonLedgerService.sendICPTs(req);
  };

  // Uses the passed in neuron to make a few dummy proposals.
  // Should/can only be used on testnets.
  public makeDummyProposals = async (neuronId: NeuronId): Promise<void> => {
    {
      console.log("make a 'Motion' proposal");
      const manageNeuronResponse = await this.makeMotionProposal({
        neuronId,
        url: "http://free-stuff-for-all.com",
        text: "We think that it is too expensive to run canisters on the IC. The long term goal of the IC should be to reduce the cycles cost of all operations by a factor of 10! Please pass this motion",
        summary: "Change the world with the IC - lower all prices!",
      });
      console.log(manageNeuronResponse);
    }

    {
      console.log("make a 'NetworkEconomics' proposal");
      const manageNeuronResponse = await this.makeNetworkEconomicsProposal({
        neuronId,
        url: "https://www.lipsum.com/",
        summary: "Increase minimum neuron stake",
        networkEconomics: {
          neuronMinimumStake: BigInt(100_000_000),
          maxProposalsToKeepPerTopic: 1000,
          neuronManagementFeePerProposal: BigInt(10_000),
          rejectCost: BigInt(10_000_000),
          transactionFee: BigInt(1000),
          neuronSpawnDissolveDelaySeconds: BigInt(3600 * 24 * 7),
          minimumIcpXdrRate: BigInt(1),
          maximumNodeProviderRewards: BigInt(10_000_000_000),
        },
      });
      console.log(manageNeuronResponse);
    }

    {
      console.log("make a 'RewardNodeProvider' proposal");
      const manageNeuronResponse = await this.makeRewardNodeProviderProposal({
        neuronId,
        url: "https://www.lipsum.com/",
        summary: "Reward for Node Provider 'ABC'",
        amount: BigInt(10_000_000),
        nodeProvider: this.identity.getPrincipal().toString(),
        rewardMode: {
          RewardToNeuron: { dissolveDelaySeconds: BigInt(1000) },
        },
      });
      console.log(manageNeuronResponse);
    }
  };
}

/**
 * @returns A service to interact with the governance canister with the given identity.
 */
async function governanceService(
  identity: Identity
): Promise<GovernanceService> {
  const agent = new HttpAgent({
    host: HOST,
    identity: identity,
  });

  if (FETCH_ROOT_KEY) {
    await agent.fetchRootKey();
  }

  return governanceBuilder(agent, identity);
}

/**
 * @returns A service to interact with the ledger canister with the given identity.
 */
async function ledgerService(identity: Identity): Promise<LedgerService> {
  const agent = new HttpAgent({
    host: HOST,
    identity: identity,
  });

  if (FETCH_ROOT_KEY) {
    await agent.fetchRootKey();
  }

  return ledgerBuilder(agent);
}
