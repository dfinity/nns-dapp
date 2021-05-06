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
    StopDissolvingRequest
} from "./canisters/governance/model";
import { ProposalInfo } from "./canisters/governance/model";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, {
    GetBalancesRequest,
    SendICPTsRequest
} from "./canisters/ledger/model";
import nnsUiBuilder from "./canisters/nnsUI/builder";
import NnsUiService, {
    AccountDetails,
    AttachCanisterRequest,
    AttachCanisterResult,
    CanisterDetails,
    CreateSubAccountResponse,
    GetTransactionsRequest,
    GetTransactionsResponse,
    RegisterHardwareWalletRequest,
    RegisterHardwareWalletResponse,
    RemoveHardwareWalletRequest,
    RemoveHardwareWalletResponse,
    RenameSubAccountRequest,
    RenameSubAccountResponse
} from "./canisters/nnsUI/model";
import icManagementBuilder from "./canisters/icManagement/builder";
import ICManagementService, { CanisterDetailsResponse, UpdateSettingsRequest, UpdateSettingsResponse } from "./canisters/icManagement/model";
import { create_dummy_proposals, test_canisters, test_happy_path, vote_for_authorized_subnetworks_proposal } from "./tests";
import createNeuronImpl, { CreateNeuronRequest } from "./canisters/createNeuron";
import { createCanisterImpl, topupCanisterImpl, CreateCanisterRequest, TopupCanisterRequest, CreateCanisterResponse } from "./canisters/createCanister";
import { AccountIdentifier, BlockHeight, CanisterId, E8s, NeuronId } from "./canisters/common/types";
import { LedgerIdentity } from "@dfinity/identity-ledgerhq";
import { principalToAccountIdentifier } from "./canisters/converter";

export default class ServiceApi {
    private readonly ledgerService: LedgerService;
    private readonly nnsUiService: NnsUiService;
    private readonly governanceService: GovernanceService;
    private readonly icManagementService: ICManagementService;
    private readonly host: string;
    private readonly identity: SignIdentity;

    constructor(host: string, identity: SignIdentity) {
        const agent = new HttpAgent({
            host,
            identity
        });
        this.ledgerService = ledgerBuilder(agent, identity);
        this.nnsUiService = nnsUiBuilder(agent);
        this.governanceService = governanceBuilder(agent, identity);
        this.icManagementService = icManagementBuilder(agent);
        this.host = host;
        this.identity = identity;
    }

    /* 
        ACCOUNTS
    */

    public createSubAccount = (name: string) : Promise<CreateSubAccountResponse> => {
        return this.nnsUiService.createSubAccount(name);
    }

    public renameSubAccount = (request: RenameSubAccountRequest) : Promise<RenameSubAccountResponse> => {
        return this.nnsUiService.renameSubAccount(request);
    }

    public registerHardwareWallet = (name: string, identity: LedgerIdentity) : Promise<RegisterHardwareWalletResponse> => {
        const accountIdentifier = principalToAccountIdentifier(identity.getPrincipal());
        const request: RegisterHardwareWalletRequest = {
            name,
            accountIdentifier
        };
        return this.nnsUiService.registerHardwareWallet(request);
    }

    public removeHardwareWallet = (request: RemoveHardwareWalletRequest) : Promise<RemoveHardwareWalletResponse> => {
        return this.nnsUiService.removeHardwareWallet(request);
    }

    public getAccount = async () : Promise<AccountDetails> => {
        const response = await this.nnsUiService.getAccount();
        if ("Ok" in response) {
            return response.Ok;
        } else {
            const accountIdentifier = await this.nnsUiService.addAccount();
            return {
                accountIdentifier,
                subAccounts: [],
                hardwareWalletAccounts: []
            };
        }
    }

    public getBalances = (request: GetBalancesRequest) : Promise<Record<AccountIdentifier, E8s>> => {
        return this.ledgerService.getBalances(request);
    }

    public getTransactions = (request: GetTransactionsRequest) : Promise<GetTransactionsResponse> => {
        return this.nnsUiService.getTransactions(request);
    }

    public sendICPTs = (request: SendICPTsRequest): Promise<BlockHeight> => {
        return this.ledgerService.sendICPTs(request);
    }

    /* 
        GOVERNANCE
    */

    public getNeuron = (neuronId: NeuronId) : Promise<Option<NeuronInfo>> => {
        return this.governanceService.getNeuron(neuronId);
    }

    public getNeurons = () : Promise<Array<NeuronInfo>> => {
        return this.governanceService.getNeurons();
    }

    public getPendingProposals = (): Promise<Array<ProposalInfo>> => {
        return this.governanceService.getPendingProposals();
    }

    public getProposalInfo = (proposalId: bigint) : Promise<Option<ProposalInfo>> => {
        return this.governanceService.getProposalInfo(proposalId);
    }

    public listProposals = (request: ListProposalsRequest) : Promise<ListProposalsResponse> => {
        return this.governanceService.listProposals(request);
    }

    public addHotKey = (request: AddHotKeyRequest) : Promise<EmptyResponse> => {
        return this.governanceService.addHotKey(request);
    }

    public removeHotKey = (request: RemoveHotKeyRequest) : Promise<EmptyResponse> => {
        return this.governanceService.removeHotKey(request);
    }

    public startDissolving = (request: StartDissolvingRequest) : Promise<EmptyResponse> => {
        return this.governanceService.startDissolving(request);
    }

    public stopDissolving = (request: StopDissolvingRequest) : Promise<EmptyResponse> => {
        return this.governanceService.stopDissolving(request);
    }

    public increaseDissolveDelay = (request: IncreaseDissolveDelayRequest) : Promise<EmptyResponse> => {
        return this.governanceService.increaseDissolveDelay(request);
    }

    public follow = (request: FollowRequest) : Promise<EmptyResponse> => {
        return this.governanceService.follow(request);
    }

    public registerVote = (request: RegisterVoteRequest) : Promise<EmptyResponse> => {
        return this.governanceService.registerVote(request);
    }

    public spawn = (request: SpawnRequest) : Promise<SpawnResponse> => {
        return this.governanceService.spawn(request);
    }

    public split = (request: SplitRequest) : Promise<EmptyResponse> => {
        return this.governanceService.split(request);
    }

    public disburse = (request: DisburseRequest) : Promise<DisburseResponse> => {
        return this.governanceService.disburse(request);
    }

    public disburseToNeuron = (request: DisburseToNeuronRequest) : Promise<DisburseToNeuronResponse> => {
        return this.governanceService.disburseToNeuron(request);
    }

    public makeMotionProposal = (request: MakeMotionProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeMotionProposal(request);
    }

    public makeNetworkEconomicsProposal = (request: MakeNetworkEconomicsProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeNetworkEconomicsProposal(request);
    }

    public makeRewardNodeProviderProposal = (request: MakeRewardNodeProviderProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeRewardNodeProviderProposal(request);
    }

    public makeSetDefaultFolloweesProposal = (request: MakeSetDefaultFolloweesProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeSetDefaultFolloweesProposal(request);
    }

    public createNeuron = (request: CreateNeuronRequest) : Promise<NeuronId> => {
        return createNeuronImpl(
            this.identity, 
            this.ledgerService, 
            request);
    }

    /*
        CANISTERS
    */

    public createCanister = (request: CreateCanisterRequest) : Promise<CreateCanisterResponse> => {
        return createCanisterImpl(
            this.identity.getPrincipal(), 
            this.ledgerService, 
            this.nnsUiService,
            request);
    }

    public topupCanister = (request: TopupCanisterRequest) : Promise<boolean> => {
        return topupCanisterImpl(
            this.ledgerService, 
            request);
    }

    public attachCanister = (request: AttachCanisterRequest) : Promise<AttachCanisterResult> => {
        return this.nnsUiService.attachCanister(request);
    }

    public getCanisters = (): Promise<Array<CanisterDetails>> => {
        return this.nnsUiService.getCanisters();
    }

    public getCanisterDetails = (canisterId: CanisterId): Promise<CanisterDetailsResponse> => {
        return this.icManagementService.getCanisterDetails(canisterId);
    }

    public updateCanisterSettings = (request: UpdateSettingsRequest): Promise<UpdateSettingsResponse> => {
        return this.icManagementService.updateSettings(request);
    }    

    public getIcpToCyclesConversionRate = (): Promise<bigint> => {
        return this.nnsUiService.getIcpToCyclesConversionRate();
    } 

    /* 
        TEMPOARY 
    */

    // Temporary method for demo purposes only, to give the specified account some ICPTs
    // by sending from the anon account which has been gifted lots of ICPTs
    public acquireICPTs = async (accountIdentifier: AccountIdentifier, e8s: E8s): Promise<void> => {
        const anonIdentity = new AnonymousIdentity();
        const agent = new HttpAgent({
            host: this.host,
            identity: anonIdentity
        });
        const anonLedgerService = ledgerBuilder(agent, anonIdentity);
        const req = {
            to: accountIdentifier,
            amount: e8s
        }
        await anonLedgerService.sendICPTs(req);
    }

    // Temporary method to trigger test code from the UI
    public integrationTest = async (): Promise<void> => {
        await test_canisters(this.host, this.identity);
        // await vote_for_authorized_subnetworks_proposal(this.host, this.identity);
        // await test_happy_path(this.host, this.identity);
    }

    // Temporary method to trigger test code from the UI
    public createDummyProposals = (neuronId: string): Promise<void> => {
        return create_dummy_proposals(this.host, this.identity, BigInt(neuronId));
    }
}
