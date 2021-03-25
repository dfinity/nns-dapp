import type { Principal } from "@dfinity/agent";
import { Option } from "../option";

export type Action =
    { ExternalUpdate: ExternalUpdate } |
    { ManageNeuron: ManageNeuron } |
    { ApproveKyc: ApproveKyc } |
    { NetworkEconomics: NetworkEconomics } |
    { RewardNodeProvider: RewardNodeProvider } |
    { AddOrRemoveNodeProvider: AddOrRemoveNodeProvider } |
    { Motion: Motion };
export interface AddHotKey { newHotKey: Option<Principal> };
export interface AddOrRemoveNodeProvider { change: Option<Change> };
export interface Amount { doms: bigint };
export interface ApproveKyc { principals: Array<Principal> };
export type AuthzChangeOp = { Authorize: { addSelf: boolean } } |
    { Deauthorize: null };
export interface Ballot { vote: number, votingPower: bigint };
export interface BallotInfo {
    vote: number,
    proposalId: Option<NeuronId>,
};
export interface CanisterAuthzInfo { methodsAuthz: Array<MethodAuthzInfo> };
export type Change = { ToRemove: NodeProvider } |
    { ToAdd: NodeProvider };
export type Command = { Spawn: Spawn } |
    { Split: Split } |
    { Follow: Follow } |
    { Configure: Configure } |
    { RegisterVote: RegisterVote } |
    { DisburseToNeuron: DisburseToNeuron } |
    { MakeProposal: Proposal } |
    { Disburse: Disburse };
export type Command_1 = { Spawn: SpawnResponse } |
    { Split: SpawnResponse } |
    { Follow: {} } |
    { Configure: {} } |
    { RegisterVote: {} } |
    { DisburseToNeuron: SpawnResponse } |
    { MakeProposal: MakeProposalResponse } |
    { Disburse: DisburseResponse };
export interface Configure { operation: Option<Operation> };
export interface Disburse {
    toSubaccount: Array<number>,
    toAccount: Option<Principal>,
    amount: Option<Amount>,
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
    payload: Array<number>,
};
export interface Follow { topic: number, followees: Array<NeuronId> };
export interface Followees { followees: Array<NeuronId> };
export interface GovernanceError {
    errorMessage: string,
    errorType: number,
};
export interface IncreaseDissolveDelay {
    additionalDissolveDelaySeconds: number,
};
export interface MakeProposalResponse { proposalId: Option<NeuronId> };
export interface ManageNeuron {
    id: Option<NeuronId>,
    command: Option<Command>,
};
export interface ManageNeuronResponse { command: Option<Command_1> };
export interface MethodAuthzChange {
    principal: Option<Principal>,
    methodName: string,
    canister: Principal,
    operation: AuthzChangeOp,
};
export interface MethodAuthzInfo {
    methodName: string,
    principalIds: Array<Array<number>>,
};
export interface Motion { motionText: string };
export interface NetworkEconomics {
    rejectCostDoms: bigint,
    nodeRewardXdrPerBillingPeriod: bigint,
    manageNeuronCostPerProposalDoms: bigint,
    neuronMinimumStakeDoms: bigint,
    neuronSpawnDissolveDelaySeconds: bigint,
    maximumNodeProviderRewardsXdr_100ths: bigint,
    minimumIcpXdrRate: bigint,
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
    account: Array<number>,
    dissolveState: Option<DissolveState>,
    followees: Array<[number, Followees]>,
    transfer: Option<NeuronStakeTransfer>,
};
export interface NeuronId { id: bigint };
export interface NeuronInfo {
    dissolveDelaySeconds: bigint,
    recentBallots: Array<BallotInfo>,
    createdTimestampSeconds: bigint,
    state: number,
    retrievedAtTimestampSeconds: bigint,
    votingPower: bigint,
    ageSeconds: bigint,
};
export interface NeuronStakeTransfer {
    toSubaccount: Array<number>,
    from: Option<Principal>,
    memo: bigint,
    neuronStakeDoms: bigint,
    fromSubaccount: Array<number>,
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
export interface ProposalInfo {
    id: Option<NeuronId>,
    ballots: Array<[bigint, Ballot]>,
    rejectCostDoms: bigint,
    proposalTimestampSeconds: bigint,
    rewardEventRound: bigint,
    failedTimestampSeconds: bigint,
    proposal: Option<Proposal>,
    proposer: Option<NeuronId>,
    tallyAtDecisionTime: Option<Tally>,
    executedTimestampSeconds: bigint,
};
export interface RegisterVote { vote: number, proposal: Option<NeuronId> };
export interface RemoveHotKey { hotKeyToRemove: Option<Principal> };
export type Result = { Ok: bigint } |
    { Err: GovernanceError };
export type Result_1 = { Ok: Neuron } |
    { Err: GovernanceError };
export type Result_2 = { Ok: NeuronInfo } |
    { Err: GovernanceError };
export type Result_3 = { Ok: ManageNeuronResponse } |
    { Err: GovernanceError };
export interface RewardNodeProvider {
    nodeProvider : Option<NodeProvider>,
    xdrAmount100ths : bigint,
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
export default interface ServiceInterface {
    // claimNeuron: (
    //     arg_0: Array<number>,
    //     arg_1: bigint,
    //     arg_2: bigint,
    // ) => Promise<Result>,
    // currentAuthz: () => Promise<CanisterAuthzInfo>,
    // executeEligibleProposals: () => Promise<undefined>,
    // getFinalizedProposals: () => Promise<Array<ProposalInfo>>,
    // getFullNeuron: (arg_0: bigint) => Promise<Result_1>,
    // getNeuronIds: () => Promise<Array<bigint>>,
    // getNeuronInfo: (arg_0: bigint) => Promise<Result_2>,
    getPendingProposals: () => Promise<Array<ProposalInfo>>,
    // getProposalInfo: (arg_0: bigint) => Promise<[] | [ProposalInfo]>,
    // manageNeuron: (arg_0: ManageNeuron) => Promise<Result_3>,
    // submitProposal: (
    //     arg_0: bigint,
    //     arg_1: Proposal,
    //     arg_2: Principal,
    // ) => Promise<bigint>,
    // updateAuthz: (arg_0: Array<MethodAuthzChange>) => Promise<undefined>,
};
