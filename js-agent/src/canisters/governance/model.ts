import type { DerEncodedBlob, Principal } from "@dfinity/agent";
import { Option } from "../option";

export type Action =
    { ExternalUpdate: ExternalUpdate } |
    { ManageNeuron: ManageNeuron } |
    { ApproveKyc: ApproveKyc } |
    { NetworkEconomics: NetworkEconomics } |
    { RewardNodeProvider: RewardNodeProvider } |
    { AddOrRemoveNodeProvider: AddOrRemoveNodeProvider } |
    { Motion: Motion };
export interface AddHotKey { newHotKey: Principal };
export interface AddOrRemoveNodeProvider { change: Change };
export interface Amount { doms: bigint };
export interface ApproveKyc { principals: Array<Principal> };
export type AuthzChangeOp = { Authorize: { addSelf: boolean } } |
    { Deauthorize: null };
export interface Ballot { neuronId: bigint, vote: Vote, votingPower: bigint };
export interface BallotInfo {
    vote: number,
    proposalId: ProposalId,
};
export interface CanisterAuthzInfo { methodsAuthz: Array<MethodAuthzInfo> };
export type Change = { ToRemove: NodeProvider } |
    { ToAdd: NodeProvider };
export type Command = 
    { Spawn: Spawn } |
    { Split: Split } |
    { Follow: Follow } |
    { Configure: Configure } |
    { RegisterVote: RegisterVote } |
    { DisburseToNeuron: DisburseToNeuron } |
    { MakeProposal: Proposal } |
    { Disburse: Disburse };
export interface Configure { operation: Operation };
export interface Disburse {
    toSubaccountId: Option<number>,
    amount: Amount,
};
export interface DisburseResponse { transferBlockHeight: bigint };
export interface DisburseToNeuron {
    dissolveDelaySeconds: bigint,
    kycVerified: boolean,
    amountDoms: bigint,
    newController: Option<Principal>,
    nonce: bigint,
};
export type DissolveState = { DissolveDelaySeconds: bigint } |
    { WhenDissolvedTimestampSeconds: bigint };
export interface ExternalUpdate {
    updateType: number,
    payload: ArrayBuffer,
};
export interface Follow { topic: Topic, followees: Array<NeuronId> };
export interface Followees { followees: Array<NeuronId> };
export interface GovernanceError {
    errorMessage: string,
    errorType: number,
};
export interface IncreaseDissolveDelay {
    additionalDissolveDelaySeconds: number,
};
export interface ListProposalsRequest {
    includeRewardStatus : Array<number>,
    beforeProposal : Option<ProposalId>,
    limit : number,
    excludeTopic : Array<number>,
    includeStatus : Array<number>,
};
export interface ListProposalsResponse {
    proposals : Array<ProposalInfo>,
};
export interface MakeProposalResponse { proposalId: ProposalId };
export interface ManageNeuron {
    id: NeuronId,
    command: Command,
};
export type ManageNeuronResponse = { Ok: ManageNeuronResponseOk } |
    { Err: GovernanceError };
export type ManageNeuronResponseCommand = { Spawn: SpawnResponse } |
    { Split: SpawnResponse } |
    { Follow: {} } |
    { Configure: {} } |
    { RegisterVote: {} } |
    { DisburseToNeuron: SpawnResponse } |
    { MakeProposal: MakeProposalResponse } |
    { Disburse: DisburseResponse };
export interface ManageNeuronResponseOk { command: Option<ManageNeuronResponseCommand> };
export interface MethodAuthzChange {
    principal: Option<Principal>,
    methodName: string,
    canister: Principal,
    operation: AuthzChangeOp,
};
export interface MethodAuthzInfo {
    methodName: string,
    principalIds: Array<ArrayBuffer>,
};
export interface Motion { motionText: string };
export interface NetworkEconomics {
    rejectCostDoms: bigint,
    manageNeuronCostPerProposalDoms: bigint,
    neuronMinimumStakeDoms: bigint,
    maximumNodeProviderRewardsDoms : bigint,
    neuronSpawnDissolveDelaySeconds: bigint,
};
export interface Neuron {
    id: Option<NeuronId>,
    controller: Option<Principal>,
    recentBallots: Array<BallotInfo>,
    kycVerified: boolean,
    notForProfit: boolean,
    cachedNeuronStakeDoms: bigint,
    createdTimestampSeconds: bigint,
    maturityDomsEquivalent: bigint,
    agingSinceTimestampSeconds: bigint,
    neuronFeesDoms: bigint,
    hotKeys: Array<Principal>,
    account: ArrayBuffer,
    dissolveState: Option<DissolveState>,
    followees: Array<[number, Followees]>,
    transfer: Option<NeuronStakeTransfer>,
};
export interface NeuronId { id: bigint };
export enum NeuronState {
	UNSPECIFIED = 0,
	LOCKED = 1,
	DISSOLVING = 2,
	DISSOLVED = 3
}
export interface NeuronInfo {
    neuronId: bigint,
    dissolveDelaySeconds: bigint,
    recentBallots: Array<BallotInfo>,
    createdTimestampSeconds: bigint,
    state: NeuronState,
    retrievedAtTimestampSeconds: bigint,
    votingPower: bigint,
    ageSeconds: bigint,
    fullNeuron: Neuron
};
export interface NeuronStakeTransfer {
    toSubaccount: ArrayBuffer,
    from: Option<Principal>,
    memo: bigint,
    neuronStakeDoms: bigint,
    fromSubaccount: ArrayBuffer,
    transferTimestamp: bigint,
    blockHeight: bigint,
};
export interface NodeProvider { id: Option<Principal> };
export type Operation = { RemoveHotKey: RemoveHotKey } |
    { AddHotKey: AddHotKey } |
    { StopDissolving: {} } |
    { StartDissolving: {} } |
    { IncreaseDissolveDelay: IncreaseDissolveDelay };
export interface Proposal {
    url: string,
    action: Option<Action>,
    summary: string,
};
export interface ProposalId { id: bigint };

export interface ProposalInfo {
    id: ProposalId,
    ballots: Array<Ballot>,
    rejectCostDoms: bigint,
    proposalTimestampSeconds: bigint,
    rewardEventRound: bigint,
    failedTimestampSeconds: bigint,
    decidedTimestampSeconds: bigint,
    latestTally: Tally,
    proposal: Proposal,
    proposer: NeuronId,
    executedTimestampSeconds: bigint,
};

export enum Vote {
	UNSPECIFIED = 0,
	YES = 1,
	NO = 2
}  
export interface RegisterVote { vote: Vote, proposal: ProposalId };
export interface RemoveHotKey { hotKeyToRemove: Option<Principal> };

export type ClaimNeuronRequest = {
    publicKey: DerEncodedBlob,
    nonce: bigint,
    dissolveDelayInSecs: bigint
}

export type ClaimNeuronResponse = { Ok: bigint } |
    { Err: GovernanceError };
export type GetFullNeuronResponse = { Ok: Neuron } |
    { Err: GovernanceError };
export type GetNeuronInfoResponse = { Ok: NeuronInfo } |
    { Err: GovernanceError };
export interface RewardNodeProvider {
    nodeProvider : Option<NodeProvider>,
    amountDoms : bigint,
};
export interface Spawn { newController: Option<Principal> };
export interface SpawnResponse { createdNeuronId: Option<NeuronId> };
export interface Split { amountDoms: bigint };
export interface Tally {
    no: bigint,
    yes: bigint,
    total: bigint,
    timestampSeconds: bigint,
};
export enum Topic {
    // https://github.com/dfinity-lab/dfinity/blob/99289f7b58f22268d8575b94971655e8f4567a8a/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto#L26
    Unspecified = 0,
    ManageNeuron = 1,
    ExchangeRate = 2,
    NetworkEconomics = 3,
    Governance = 4,
    NodeAdmin = 5,
    ParticipantManagement = 6,
    SubnetManagement = 7,
    NetworkCanisterManagement = 8,
    Kyc = 9,
};
export default interface ServiceInterface {
    // currentAuthz: () => Promise<CanisterAuthzInfo>,
    // executeEligibleProposals: () => Promise<undefined>,
    claimNeuron: (request: ClaimNeuronRequest) => Promise<ClaimNeuronResponse>,
    getNeurons: () => Promise<Array<NeuronInfo>>,
    getPendingProposals: () => Promise<Array<ProposalInfo>>,
    getProposalInfo: (proposalId: bigint) => Promise<Option<ProposalInfo>>,
    listProposals: (request: ListProposalsRequest) => Promise<ListProposalsResponse>,
    manageNeuron: (arg_0: ManageNeuron) => Promise<ManageNeuronResponse>,
    // submitProposal: (
    //     arg_0: bigint,
    //     arg_1: Proposal,
    //     arg_2: Principal,
    // ) => Promise<bigint>,
    // updateAuthz: (arg_0: Array<MethodAuthzChange>) => Promise<undefined>,
};
