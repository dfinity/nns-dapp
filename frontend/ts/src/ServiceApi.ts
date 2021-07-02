import { AnonymousIdentity, HttpAgent, SignIdentity } from "@dfinity/agent";
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
  NeuronInfo,
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
import nnsUiBuilder from "./canisters/nnsUI/builder";
import NnsUiService, {
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
  RemoveHardwareWalletRequest,
  RemoveHardwareWalletResponse,
  RenameSubAccountRequest,
  RenameSubAccountResponse,
} from "./canisters/nnsUI/model";
import icManagementBuilder from "./canisters/icManagement/builder";
import ICManagementService, {
  CanisterDetailsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from "./canisters/icManagement/model";
import createNeuronImpl, {
  CreateNeuronRequest,
} from "./canisters/createNeuron";
import topUpNeuronImpl, {
  TopUpNeuronRequest,
} from "./canisters/topUpNeuron";
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
} from "./canisters/common/types";
import { LedgerIdentity } from "@dfinity/identity-ledgerhq";
import { HOST } from "./canisters/constants";
import { executeWithLogging } from "./errorLogger";
import { FETCH_ROOT_KEY } from "./config.json";
import {
  topUpCanisterImpl,
  TopUpCanisterRequest,
  TopUpCanisterResponse,
} from "./canisters/topUpCanister";

export default class ServiceApi {
  private readonly ledgerService: LedgerService;
  private readonly nnsUiService: NnsUiService;
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
    this.ledgerService = ledgerBuilder(agent, identity);
    this.nnsUiService = nnsUiBuilder(agent);
    this.governanceService = governanceBuilder(agent, identity);
    this.icManagementService = icManagementBuilder(agent);
    this.identity = identity;
  }

  /* 
        ACCOUNTS
    */

  public createSubAccount = (
    name: string
  ): Promise<CreateSubAccountResponse> => {
    return executeWithLogging(() => this.nnsUiService.createSubAccount(name));
  };

  public renameSubAccount = (
    request: RenameSubAccountRequest
  ): Promise<RenameSubAccountResponse> => {
    return executeWithLogging(() =>
      this.nnsUiService.renameSubAccount(request)
    );
  };

  public registerHardwareWallet = (
    name: string,
    identity: LedgerIdentity
  ): Promise<RegisterHardwareWalletResponse> => {
    const request: RegisterHardwareWalletRequest = {
      name,
      principal: identity.getPrincipal().toString(),
    };
    return executeWithLogging(() =>
      this.nnsUiService.registerHardwareWallet(request)
    );
  };

  public removeHardwareWallet = (
    request: RemoveHardwareWalletRequest
  ): Promise<RemoveHardwareWalletResponse> => {
    return executeWithLogging(() =>
      this.nnsUiService.removeHardwareWallet(request)
    );
  };

  public getAccount = async (): Promise<AccountDetails> => {
    const response = await executeWithLogging(() =>
      this.nnsUiService.getAccount()
    );
    if ("Ok" in response) {
      return response.Ok;
    } else {
      const accountIdentifier = await executeWithLogging(() =>
        this.nnsUiService.addAccount()
      );
      return {
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
    return executeWithLogging(() => this.nnsUiService.getTransactions(request));
  };

  public sendICPTs = (request: SendICPTsRequest): Promise<BlockHeight> => {
    return executeWithLogging(() => this.ledgerService.sendICPTs(request));
  };

  /* 
        GOVERNANCE
    */

  public getNeuron = (neuronId: NeuronId): Promise<Option<NeuronInfo>> => {
    return executeWithLogging(() => this.governanceService.getNeuron(neuronId));
  };

  public getNeurons = (): Promise<Array<NeuronInfo>> => {
    return executeWithLogging(() => this.governanceService.getNeurons());
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
    request: RemoveHotKeyRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(() =>
      this.governanceService.removeHotKey(request)
    );
  };

  public startDissolving = (
    request: StartDissolvingRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(() =>
      this.governanceService.startDissolving(request)
    );
  };

  public stopDissolving = (
    request: StopDissolvingRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(() =>
      this.governanceService.stopDissolving(request)
    );
  };

  public increaseDissolveDelay = (
    request: IncreaseDissolveDelayRequest
  ): Promise<EmptyResponse> => {
    return executeWithLogging(() =>
      this.governanceService.increaseDissolveDelay(request)
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

  public spawn = (request: SpawnRequest): Promise<SpawnResponse> => {
    return executeWithLogging(() => this.governanceService.spawn(request));
  };

  public split = (request: SplitRequest): Promise<EmptyResponse> => {
    return executeWithLogging(() => this.governanceService.split(request));
  };

  public disburse = (request: DisburseRequest): Promise<DisburseResponse> => {
    return executeWithLogging(() => this.governanceService.disburse(request));
  };

  public disburseToNeuron = (
    request: DisburseToNeuronRequest
  ): Promise<DisburseToNeuronResponse> => {
    return executeWithLogging(() =>
      this.governanceService.disburseToNeuron(request)
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

  public createNeuron = (request: CreateNeuronRequest): Promise<NeuronId> => {
    return executeWithLogging(() =>
      createNeuronImpl(
        this.identity.getPrincipal().toString(),
        this.ledgerService,
        this.nnsUiService,
        request
      )
    );
  };

  public topUpNeuron = (request: TopUpNeuronRequest) : Promise<void> => {
    return executeWithLogging(() =>
      topUpNeuronImpl(
        this.ledgerService,
        this.nnsUiService,
        request
      )
    );
  }

  /*
        CANISTERS
    */

  public createCanister = (
    request: CreateCanisterRequest
  ): Promise<CreateCanisterResponse> => {
    return executeWithLogging(() =>
      createCanisterImpl(
        this.identity.getPrincipal().toString(),
        this.ledgerService,
        this.nnsUiService,
        request
      )
    );
  };

  public topUpCanister = (
    request: TopUpCanisterRequest
  ): Promise<TopUpCanisterResponse> => {
    return executeWithLogging(() =>
      topUpCanisterImpl(this.ledgerService, this.nnsUiService, request)
    );
  };

  public attachCanister = (
    request: AttachCanisterRequest
  ): Promise<AttachCanisterResult> => {
    return executeWithLogging(() => this.nnsUiService.attachCanister(request));
  };

  public detachCanister = (
    request: DetachCanisterRequest
  ): Promise<DetachCanisterResponse> => {
    return executeWithLogging(() => this.nnsUiService.detachCanister(request));
  };

  public getCanisters = (): Promise<Array<CanisterDetails>> => {
    return executeWithLogging(() => this.nnsUiService.getCanisters());
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
      this.nnsUiService.getIcpToCyclesConversionRate()
    );
  };

  // Gives the caller the specified amount of (fake) ICPs.
  // Should/can only be used on testnets.
  public acquireICPTs = async (
    accountIdentifier: AccountIdentifier,
    e8s: E8s
  ): Promise<void> => {
    const anonIdentity = new AnonymousIdentity();
    const agent = new HttpAgent({
      host: HOST,
      identity: anonIdentity,
    });
    await agent.fetchRootKey();
    const anonLedgerService = ledgerBuilder(agent, anonIdentity);
    const req = {
      to: accountIdentifier,
      amount: e8s,
    };
    await anonLedgerService.sendICPTs(req);
  };
}
