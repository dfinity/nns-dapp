import { DerEncodedBlob } from "@dfinity/candid";
import { Option } from "../option";
import {
  AccountIdentifier,
  CanisterIdString,
  E8s,
  NeuronId,
  PrincipalString,
} from "../common/types";

export type Action =
  | { ExecuteNnsFunction: ExecuteNnsFunction }
  | { ManageNeuron: ManageNeuron }
  | { ApproveGenesisKyc: ApproveGenesisKyc }
  | { ManageNetworkEconomics: NetworkEconomics }
  | { RewardNodeProvider: RewardNodeProvider }
  | { AddOrRemoveNodeProvider: AddOrRemoveNodeProvider }
  | { SetDefaultFollowees: SetDefaultFollowees }
  | { Motion: Motion };
export interface AddHotKey {
  newHotKey: Option<PrincipalString>;
}
export interface AddOrRemoveNodeProvider {
  change: Option<Change>;
}
export interface ApproveGenesisKyc {
  principals: Array<PrincipalString>;
}
export type AuthzChangeOp =
  | { Authorize: { addSelf: boolean } }
  | { Deauthorize: null };
export interface Ballot {
  neuronId: bigint;
  vote: Vote;
  votingPower: bigint;
}
export interface BallotInfo {
  vote: Vote;
  proposalId: Option<ProposalId>;
}
export interface CanisterAuthzInfo {
  methodsAuthz: Array<MethodAuthzInfo>;
}
export type Change = { ToRemove: NodeProvider } | { ToAdd: NodeProvider };
export type Command =
  | { Spawn: Spawn }
  | { Split: Split }
  | { Follow: Follow }
  | { Configure: Configure }
  | { RegisterVote: RegisterVote }
  | { DisburseToNeuron: DisburseToNeuron }
  | { MakeProposal: Proposal }
  | { Disburse: Disburse };
export interface Configure {
  operation: Option<Operation>;
}
export interface Disburse {
  toAccountId: Option<AccountIdentifier>;
  amount: Option<E8s>;
}
export interface DisburseResponse {
  transferBlockHeight: bigint;
}
export interface DisburseToNeuron {
  dissolveDelaySeconds: bigint;
  kycVerified: boolean;
  amount: E8s;
  newController: Option<PrincipalString>;
  nonce: bigint;
}
export type DissolveState =
  | { DissolveDelaySeconds: bigint }
  | { WhenDissolvedTimestampSeconds: bigint };
export interface ExecuteNnsFunction {
  nnsFunction: number;
  payload: ArrayBuffer;
}
export interface Follow {
  topic: Topic;
  followees: Array<NeuronId>;
}
export interface Followees {
  topic: Topic;
  followees: Array<NeuronId>;
}
export interface GovernanceError {
  errorMessage: string;
  errorType: number;
}
export interface IncreaseDissolveDelay {
  additionalDissolveDelaySeconds: number;
}
export interface SetDissolveTimestamp {
  dissolveTimestampSeconds: bigint;
}
export interface ListProposalsRequest {
  // Limit on the number of [ProposalInfo] to return. If no value is
  // specified, or if a value greater than 100 is specified, 100
  // will be used.
  limit: number;

  // If specified, only return proposals that are stricty earlier than
  // the specified proposal according to the proposal ID. If not
  // specified, start with the most recent proposal.
  beforeProposal: Option<ProposalId>;

  // Include proposals that have a reward status in this list (see
  // [ProposalRewardStatus] for more information). If this list is
  // empty, no restriction is applied. For example, many users listing
  // proposals will only be interested in proposals for which they can
  // receive voting rewards, i.e., with reward status
  // PROPOSAL_REWARD_STATUS_ACCEPT_VOTES.
  includeRewardStatus: Array<ProposalRewardStatus>;

  // Exclude proposals with a topic in this list. This is particularly
  // useful to exclude proposals on the topics TOPIC_EXCHANGE_RATE and
  // TOPIC_KYC which most users are not likely to be interested in
  // seeing
  excludeTopic: Array<Topic>;

  // Include proposals that have a status in this list (see
  // [ProposalStatus] for more information). If this list is empty, no
  // restriction is applied.
  includeStatus: Array<ProposalStatus>;
}
export interface ListProposalsResponse {
  proposals: Array<ProposalInfo>;
}
export interface MakeProposalResponse {
  proposalId: ProposalId;
}
export interface ManageNeuron {
  id: Option<NeuronId>;
  command: Option<Command>;
}
export interface MethodAuthzChange {
  principal: Option<PrincipalString>;
  methodName: string;
  canister: CanisterIdString;
  operation: AuthzChangeOp;
}
export interface MethodAuthzInfo {
  methodName: string;
  principalIds: Array<ArrayBuffer>;
}
export interface Motion {
  motionText: string;
}
export interface NetworkEconomics {
  neuronMinimumStake: E8s;
  maxProposalsToKeepPerTopic: number;
  neuronManagementFeePerProposal: E8s;
  rejectCost: E8s;
  transactionFee: E8s;
  neuronSpawnDissolveDelaySeconds: bigint;
  minimumIcpXdrRate: bigint;
  maximumNodeProviderRewards: bigint;
}
export interface Neuron {
  id: Option<NeuronId>;
  isCurrentUserController: Option<boolean>;
  controller: Option<PrincipalString>;
  recentBallots: Array<BallotInfo>;
  kycVerified: boolean;
  notForProfit: boolean;
  cachedNeuronStake: E8s;
  createdTimestampSeconds: bigint;
  maturityE8sEquivalent: bigint;
  agingSinceTimestampSeconds: bigint;
  neuronFees: E8s;
  hotKeys: Array<PrincipalString>;
  accountIdentifier: AccountIdentifier;
  dissolveState: Option<DissolveState>;
  followees: Array<Followees>;
}
export enum NeuronState {
  UNSPECIFIED = 0,
  LOCKED = 1,
  DISSOLVING = 2,
  DISSOLVED = 3,
}
export interface NeuronInfo {
  neuronId: NeuronId;
  dissolveDelaySeconds: bigint;
  recentBallots: Array<BallotInfo>;
  createdTimestampSeconds: bigint;
  state: NeuronState;
  retrievedAtTimestampSeconds: bigint;
  votingPower: bigint;
  ageSeconds: bigint;
  fullNeuron: Option<Neuron>;
}
export interface NodeProvider {
  id: Option<PrincipalString>;
}
export type Operation =
  | { RemoveHotKey: RemoveHotKey }
  | { AddHotKey: AddHotKey }
  | { StopDissolving: Record<string, never> }
  | { StartDissolving: Record<string, never> }
  | { IncreaseDissolveDelay: IncreaseDissolveDelay }
  | { SetDissolveTimestamp: SetDissolveTimestamp };
export interface Proposal {
  url: string;
  action: Option<Action>;
  summary: string;
}
export type ProposalId = bigint;

export interface ProposalInfo {
  id: Option<ProposalId>;
  ballots: Array<Ballot>;
  rejectCost: E8s;
  proposalTimestampSeconds: bigint;
  rewardEventRound: bigint;
  failedTimestampSeconds: bigint;
  decidedTimestampSeconds: bigint;
  latestTally: Option<Tally>;
  proposal: Option<Proposal>;
  proposer: Option<NeuronId>;
  executedTimestampSeconds: bigint;
  topic: Topic;
  status: ProposalStatus;
  rewardStatus: ProposalRewardStatus;
}

// The proposal status, with respect to reward distribution.
// See also ProposalStatus.
export enum ProposalRewardStatus {
  PROPOSAL_REWARD_STATUS_UNKNOWN = 0,

  // The proposal still accept votes, for the purpose of
  // vote rewards. This implies nothing on the ProposalStatus.
  PROPOSAL_REWARD_STATUS_ACCEPT_VOTES = 1,

  // The proposal no longer accepts votes. It is due to settle
  // at the next reward event.
  PROPOSAL_REWARD_STATUS_READY_TO_SETTLE = 2,

  // The proposal has been taken into account in a reward event.
  PROPOSAL_REWARD_STATUS_SETTLED = 3,

  // The proposal is not eligible to be taken into account in a reward event.
  PROPOSAL_REWARD_STATUS_INELIGIBLE = 4,
}

// The proposal status, with respect to decision making and execution.
// See also ProposalRewardStatus.
export enum ProposalStatus {
  PROPOSAL_STATUS_UNKNOWN = 0,

  // A decision (accept/reject) has yet to be made.
  PROPOSAL_STATUS_OPEN = 1,

  // The proposal has been rejected.
  PROPOSAL_STATUS_REJECTED = 2,

  // The proposal has been accepted. At this time, either execution
  // as not yet started, or it has but the outcome is not yet known.
  PROPOSAL_STATUS_ACCEPTED = 3,

  // The proposal was accepted and successfully executed.
  PROPOSAL_STATUS_EXECUTED = 4,

  // The proposal was accepted, but execution failed.
  PROPOSAL_STATUS_FAILED = 5,
}

export enum Vote {
  UNSPECIFIED = 0,
  YES = 1,
  NO = 2,
}
export interface RegisterVote {
  vote: Vote;
  proposal: Option<ProposalId>;
}
export interface RemoveHotKey {
  hotKeyToRemove: Option<PrincipalString>;
}
export type RewardMode =
  | { RewardToNeuron: RewardToNeuron }
  | { RewardToAccount: RewardToAccount };
export interface RewardToAccount {
  toAccount: Option<AccountIdentifier>;
}
export interface RewardToNeuron {
  dissolveDelaySeconds: bigint;
}

export type ClaimNeuronRequest = {
  publicKey: DerEncodedBlob;
  nonce: bigint;
  dissolveDelayInSecs: bigint;
};

export type ClaimNeuronResponse = { Ok: null } | { Err: GovernanceError };
export type GetFullNeuronResponse = { Ok: Neuron } | { Err: GovernanceError };
export type GetNeuronInfoResponse =
  | { Ok: NeuronInfo }
  | { Err: GovernanceError };
export interface RewardNodeProvider {
  nodeProvider: Option<NodeProvider>;
  rewardMode: Option<RewardMode>;
  amountE8s: bigint;
}
export interface SetDefaultFollowees {
  defaultFollowees: Array<Followees>;
}
export interface Spawn {
  newController: Option<PrincipalString>;
}
export interface SpawnResponse {
  createdNeuronId: NeuronId;
}
export interface Split {
  amount: E8s;
}
export interface Tally {
  no: bigint;
  yes: bigint;
  total: bigint;
  timestampSeconds: bigint;
}
export enum Topic {
  // https://github.com/dfinity/ic/blob/master/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto#L27
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
}

export interface AddHotKeyRequest {
  neuronId: NeuronId;
  principal: PrincipalString;
}

export interface RemoveHotKeyRequest {
  neuronId: NeuronId;
  principal: PrincipalString;
}

export interface StartDissolvingRequest {
  neuronId: NeuronId;
}

export interface StopDissolvingRequest {
  neuronId: NeuronId;
}

export interface IncreaseDissolveDelayRequest {
  neuronId: NeuronId;
  additionalDissolveDelaySeconds: number;
}

export interface FollowRequest {
  neuronId: NeuronId;
  topic: Topic;
  followees: Array<NeuronId>;
}

export interface RegisterVoteRequest {
  neuronId: NeuronId;
  vote: Vote;
  proposal: ProposalId;
}

export interface SpawnRequest {
  neuronId: NeuronId;
  newController: Option<PrincipalString>;
}

export interface SplitRequest {
  neuronId: NeuronId;
  amount: E8s;
}

export interface DisburseRequest {
  neuronId: NeuronId;
  toAccountId: AccountIdentifier;
  amount?: E8s;
}

export interface DisburseToNeuronRequest {
  neuronId: NeuronId;
  dissolveDelaySeconds: bigint;
  kycVerified: boolean;
  amount: E8s;
  newController: Option<PrincipalString>;
  nonce: bigint;
}

export interface MakeMotionProposalRequest {
  neuronId: NeuronId;
  url: string;
  text: string;
  summary: string;
}

export interface MakeNetworkEconomicsProposalRequest {
  neuronId: NeuronId;
  summary: string;
  url: string;
  networkEcomomics: NetworkEconomics;
}

export interface MakeRewardNodeProviderProposalRequest {
  neuronId: NeuronId;
  summary: string;
  url: string;
  nodeProvider: PrincipalString;
  amount: E8s;
  rewardMode: Option<RewardMode>;
}

export interface MakeSetDefaultFolloweesProposalRequest {
  neuronId: NeuronId;
  summary: string;
  url: string;
  followees: Array<Followees>;
}

export interface DisburseToNeuronResponse {
  createdNeuronId: NeuronId;
}
export interface SpawnResponse {
  createdNeuronId: NeuronId;
}
export type EmptyResponse = { Ok: null } | { Err: GovernanceError };

export default interface ServiceInterface {
  getNeuron: (neuronId: NeuronId) => Promise<Option<NeuronInfo>>;
  getNeurons: () => Promise<Array<NeuronInfo>>;
  getPendingProposals: () => Promise<Array<ProposalInfo>>;
  getProposalInfo: (proposalId: bigint) => Promise<Option<ProposalInfo>>;
  listProposals: (
    request: ListProposalsRequest
  ) => Promise<ListProposalsResponse>;
  addHotKey: (request: AddHotKeyRequest) => Promise<EmptyResponse>;
  removeHotKey: (request: RemoveHotKeyRequest) => Promise<EmptyResponse>;
  startDissolving: (request: StartDissolvingRequest) => Promise<EmptyResponse>;
  stopDissolving: (request: StopDissolvingRequest) => Promise<EmptyResponse>;
  increaseDissolveDelay: (
    request: IncreaseDissolveDelayRequest
  ) => Promise<EmptyResponse>;
  follow: (request: FollowRequest) => Promise<EmptyResponse>;
  registerVote: (request: RegisterVoteRequest) => Promise<EmptyResponse>;
  spawn: (request: SpawnRequest) => Promise<SpawnResponse>;
  split: (request: SplitRequest) => Promise<EmptyResponse>;
  disburse: (request: DisburseRequest) => Promise<DisburseResponse>;
  disburseToNeuron: (
    request: DisburseToNeuronRequest
  ) => Promise<DisburseToNeuronResponse>;
  makeMotionProposal: (
    request: MakeMotionProposalRequest
  ) => Promise<MakeProposalResponse>;
  makeNetworkEconomicsProposal: (
    request: MakeNetworkEconomicsProposalRequest
  ) => Promise<MakeProposalResponse>;
  makeRewardNodeProviderProposal: (
    request: MakeRewardNodeProviderProposalRequest
  ) => Promise<MakeProposalResponse>;
  makeSetDefaultFolloweesProposal: (
    request: MakeSetDefaultFolloweesProposalRequest
  ) => Promise<MakeProposalResponse>;
}
