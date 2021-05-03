import type { Principal } from '@dfinity/agent';
export interface AccountIdentifier {
  'hash' : Array<number>,
};
export type Action = { 'ManageNeuron' : ManageNeuron } |
  { 'ExecuteNnsFunction' : ExecuteNnsFunction } |
  { 'RewardNodeProvider' : RewardNodeProvider } |
  { 'SetDefaultFollowees' : SetDefaultFollowees } |
  { 'ManageNetworkEconomics' : NetworkEconomics } |
  { 'ApproveGenesisKyc' : ApproveGenesisKyc } |
  { 'AddOrRemoveNodeProvider' : AddOrRemoveNodeProvider } |
  { 'Motion' : Motion };
export interface AddHotKey { 'new_hot_key' : [] | [Principal] };
export interface AddOrRemoveNodeProvider { 'change' : [] | [Change] };
export interface Amount { 'e8s' : bigint };
export interface ApproveGenesisKyc { 'principals' : Array<Principal> };
export type AuthzChangeOp = { 'Authorize' : { 'add_self' : boolean } } |
  { 'Deauthorize' : null };
export interface Ballot { 'vote' : number, 'voting_power' : bigint };
export interface BallotInfo {
  'vote' : number,
  'proposal_id' : [] | [NeuronId],
};
export interface CanisterAuthzInfo { 'methods_authz' : Array<MethodAuthzInfo> };
export type Change = { 'ToRemove' : NodeProvider } |
  { 'ToAdd' : NodeProvider };
export type Command = { 'Spawn' : Spawn } |
  { 'Split' : Split } |
  { 'Follow' : Follow } |
  { 'Configure' : Configure } |
  { 'RegisterVote' : RegisterVote } |
  { 'DisburseToNeuron' : DisburseToNeuron } |
  { 'MakeProposal' : Proposal } |
  { 'Disburse' : Disburse };
export type Command_1 = { 'Error' : GovernanceError } |
  { 'Spawn' : SpawnResponse } |
  { 'Split' : SpawnResponse } |
  { 'Follow' : {} } |
  { 'Configure' : {} } |
  { 'RegisterVote' : {} } |
  { 'DisburseToNeuron' : SpawnResponse } |
  { 'MakeProposal' : MakeProposalResponse } |
  { 'Disburse' : DisburseResponse };
export type Command_2 = { 'Spawn' : Spawn } |
  { 'Split' : Split } |
  { 'DisburseToNeuron' : DisburseToNeuron } |
  { 'Disburse' : Disburse };
export interface Configure { 'operation' : [] | [Operation] };
export interface CreateNeuron { 'dissolve_delay_seconds' : bigint };
export interface Disburse {
  'to_account' : [] | [AccountIdentifier],
  'amount' : [] | [Amount],
};
export interface DisburseResponse { 'transfer_block_height' : bigint };
export interface DisburseToNeuron {
  'dissolve_delay_seconds' : bigint,
  'kyc_verified' : boolean,
  'amount_e8s' : bigint,
  'new_controller' : [] | [Principal],
  'nonce' : bigint,
};
export type DissolveState = { 'DissolveDelaySeconds' : bigint } |
  { 'WhenDissolvedTimestampSeconds' : bigint };
export interface ExecuteNnsFunction {
  'nns_function' : number,
  'payload' : Array<number>,
};
export interface Follow { 'topic' : number, 'followees' : Array<NeuronId> };
export interface Followees { 'followees' : Array<NeuronId> };
export interface Governance {
  'default_followees' : Array<[number, Followees]>,
  'wait_for_quiet_threshold_seconds' : bigint,
  'authz' : [] | [CanisterAuthzInfo],
  'node_providers' : Array<NodeProvider>,
  'economics' : [] | [NetworkEconomics],
  'latest_reward_event' : [] | [RewardEvent],
  'to_claim_transfers' : Array<NeuronStakeTransfer>,
  'short_voting_period_seconds' : bigint,
  'proposals' : Array<[bigint, ProposalData]>,
  'in_flight_commands' : Array<[bigint, NeuronInFlightCommand]>,
  'neurons' : Array<[bigint, Neuron]>,
  'genesis_timestamp_seconds' : bigint,
};
export interface GovernanceError {
  'error_message' : string,
  'error_type' : number,
};
export interface IncreaseDissolveDelay {
  'additional_dissolve_delay_seconds' : number,
};
export interface ListNeurons {
  'neuron_ids' : Array<bigint>,
  'include_neurons_readable_by_caller' : boolean,
};
export interface ListNeuronsResponse {
  'neuron_infos' : Array<[bigint, NeuronInfo]>,
  'full_neurons' : Array<Neuron>,
};
export interface ListProposalInfo {
  'include_reward_status' : Array<number>,
  'before_proposal' : [] | [NeuronId],
  'limit' : number,
  'exclude_topic' : Array<number>,
  'include_status' : Array<number>,
};
export interface ListProposalInfoResponse {
  'proposal_info' : Array<ProposalInfo>,
};
export interface MakeProposalResponse { 'proposal_id' : [] | [NeuronId] };
export interface ManageNeuron {
  'id' : [] | [NeuronId],
  'command' : [] | [Command],
};
export interface ManageNeuronResponse { 'command' : [] | [Command_1] };
export interface MethodAuthzChange {
  'principal' : [] | [Principal],
  'method_name' : string,
  'canister' : Principal,
  'operation' : AuthzChangeOp,
};
export interface MethodAuthzInfo {
  'method_name' : string,
  'principal_ids' : Array<Array<number>>,
};
export interface Motion { 'motion_text' : string };
export interface NetworkEconomics {
  'neuron_minimum_stake_e8s' : bigint,
  'max_proposals_to_keep_per_topic' : number,
  'neuron_management_fee_per_proposal_e8s' : bigint,
  'reject_cost_e8s' : bigint,
  'transaction_fee_e8s' : bigint,
  'neuron_spawn_dissolve_delay_seconds' : bigint,
  'minimum_icp_xdr_rate' : bigint,
  'maximum_node_provider_rewards_e8s' : bigint,
};
export interface Neuron {
  'id' : [] | [NeuronId],
  'controller' : [] | [Principal],
  'recent_ballots' : Array<BallotInfo>,
  'kyc_verified' : boolean,
  'not_for_profit' : boolean,
  'maturity_e8s_equivalent' : bigint,
  'cached_neuron_stake_e8s' : bigint,
  'created_timestamp_seconds' : bigint,
  'aging_since_timestamp_seconds' : bigint,
  'hot_keys' : Array<Principal>,
  'account' : Array<number>,
  'dissolve_state' : [] | [DissolveState],
  'followees' : Array<[number, Followees]>,
  'neuron_fees_e8s' : bigint,
  'transfer' : [] | [NeuronStakeTransfer],
};
export interface NeuronId { 'id' : bigint };
export interface NeuronInFlightCommand {
  'command' : [] | [Command_2],
  'timestamp' : bigint,
};
export interface NeuronInfo {
  'dissolve_delay_seconds' : bigint,
  'recent_ballots' : Array<BallotInfo>,
  'created_timestamp_seconds' : bigint,
  'state' : number,
  'retrieved_at_timestamp_seconds' : bigint,
  'voting_power' : bigint,
  'age_seconds' : bigint,
};
export interface NeuronStakeTransfer {
  'to_subaccount' : Array<number>,
  'neuron_stake_e8s' : bigint,
  'from' : [] | [Principal],
  'memo' : bigint,
  'from_subaccount' : Array<number>,
  'transfer_timestamp' : bigint,
  'block_height' : bigint,
};
export interface NodeProvider { 'id' : [] | [Principal] };
export type Operation = { 'RemoveHotKey' : RemoveHotKey } |
  { 'AddHotKey' : AddHotKey } |
  { 'StopDissolving' : {} } |
  { 'StartDissolving' : {} } |
  { 'IncreaseDissolveDelay' : IncreaseDissolveDelay };
export interface Proposal {
  'url' : string,
  'action' : [] | [Action],
  'summary' : string,
};
export interface ProposalData {
  'id' : [] | [NeuronId],
  'ballots' : Array<[bigint, Ballot]>,
  'proposal_timestamp_seconds' : bigint,
  'reward_event_round' : bigint,
  'failed_timestamp_seconds' : bigint,
  'reject_cost_e8s' : bigint,
  'latest_tally' : [] | [Tally],
  'decided_timestamp_seconds' : bigint,
  'proposal' : [] | [Proposal],
  'proposer' : [] | [NeuronId],
  'executed_timestamp_seconds' : bigint,
};
export interface ProposalInfo {
  'id' : [] | [NeuronId],
  'status' : number,
  'topic' : number,
  'ballots' : Array<[bigint, Ballot]>,
  'proposal_timestamp_seconds' : bigint,
  'reward_event_round' : bigint,
  'failed_timestamp_seconds' : bigint,
  'reject_cost_e8s' : bigint,
  'latest_tally' : [] | [Tally],
  'reward_status' : number,
  'decided_timestamp_seconds' : bigint,
  'proposal' : [] | [Proposal],
  'proposer' : [] | [NeuronId],
  'executed_timestamp_seconds' : bigint,
};
export interface RegisterVote { 'vote' : number, 'proposal' : [] | [NeuronId] };
export interface RemoveHotKey { 'hot_key_to_remove' : [] | [Principal] };
export type Result = { 'Ok' : null } |
  { 'Err' : GovernanceError };
export type Result_1 = { 'Ok' : Neuron } |
  { 'Err' : GovernanceError };
export type Result_2 = { 'Ok' : NeuronInfo } |
  { 'Err' : GovernanceError };
export interface RewardEvent {
  'day_after_genesis' : bigint,
  'actual_timestamp_seconds' : bigint,
  'distributed_e8s_equivalent' : bigint,
  'settled_proposals' : Array<NeuronId>,
};
export interface RewardNodeProvider {
  'node_provider' : [] | [NodeProvider],
  'amount_e8s' : bigint,
  'create_neuron' : [] | [CreateNeuron],
};
export interface SetDefaultFollowees {
  'default_followees' : Array<[number, Followees]>,
};
export interface Spawn { 'new_controller' : [] | [Principal] };
export interface SpawnResponse { 'created_neuron_id' : [] | [NeuronId] };
export interface Split { 'amount_e8s' : bigint };
export interface Tally {
  'no' : bigint,
  'yes' : bigint,
  'total' : bigint,
  'timestamp_seconds' : bigint,
};
export default interface _SERVICE {
  'claim_gtc_neurons' : (arg_0: Principal, arg_1: Array<NeuronId>) => Promise<
      Result
    >,
  'current_authz' : () => Promise<CanisterAuthzInfo>,
  'get_full_neuron' : (arg_0: bigint) => Promise<Result_1>,
  'get_neuron_ids' : () => Promise<Array<bigint>>,
  'get_neuron_info' : (arg_0: bigint) => Promise<Result_2>,
  'get_pending_proposals' : () => Promise<Array<ProposalInfo>>,
  'get_proposal_info' : (arg_0: bigint) => Promise<[] | [ProposalInfo]>,
  'list_neurons' : (arg_0: ListNeurons) => Promise<ListNeuronsResponse>,
  'list_proposals' : (arg_0: ListProposalInfo) => Promise<
      ListProposalInfoResponse
    >,
  'manage_neuron' : (arg_0: ManageNeuron) => Promise<ManageNeuronResponse>,
  'submit_proposal' : (
      arg_0: bigint,
      arg_1: Proposal,
      arg_2: Principal,
    ) => Promise<bigint>,
  'transfer_gtc_neuron' : (arg_0: NeuronId, arg_1: NeuronId) => Promise<Result>,
  'update_authz' : (arg_0: Array<MethodAuthzChange>) => Promise<undefined>,
};
