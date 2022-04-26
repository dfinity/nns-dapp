import type { Principal } from '@dfinity/principal';
export interface AccountIdentifier { 'hash' : Array<number> }
export type Action = { 'RegisterKnownNeuron' : KnownNeuron } |
  { 'ManageNeuron' : ManageNeuron } |
  { 'ExecuteNnsFunction' : ExecuteNnsFunction } |
  { 'RewardNodeProvider' : RewardNodeProvider } |
  { 'SetDefaultFollowees' : SetDefaultFollowees } |
  { 'RewardNodeProviders' : RewardNodeProviders } |
  { 'ManageNetworkEconomics' : NetworkEconomics } |
  { 'ApproveGenesisKyc' : ApproveGenesisKyc } |
  { 'AddOrRemoveNodeProvider' : AddOrRemoveNodeProvider } |
  { 'Motion' : Motion };
export interface AddHotKey { 'new_hot_key' : [] | [Principal] }
export interface AddOrRemoveNodeProvider { 'change' : [] | [Change] }
export interface Amount { 'e8s' : bigint }
export interface ApproveGenesisKyc { 'principals' : Array<Principal> }
export interface Ballot { 'vote' : number, 'voting_power' : bigint }
export interface BallotInfo { 'vote' : number, 'proposal_id' : [] | [NeuronId] }
export type By = { 'NeuronIdOrSubaccount' : {} } |
  { 'MemoAndController' : ClaimOrRefreshNeuronFromAccount } |
  { 'Memo' : bigint };
export type Change = { 'ToRemove' : NodeProvider } |
  { 'ToAdd' : NodeProvider };
export interface ClaimOrRefresh { 'by' : [] | [By] }
export interface ClaimOrRefreshNeuronFromAccount {
  'controller' : [] | [Principal],
  'memo' : bigint,
}
export interface ClaimOrRefreshNeuronFromAccountResponse {
  'result' : [] | [Result_1],
}
export interface ClaimOrRefreshResponse {
  'refreshed_neuron_id' : [] | [NeuronId],
}
export type Command = { 'Spawn' : Spawn } |
  { 'Split' : Split } |
  { 'Follow' : Follow } |
  { 'ClaimOrRefresh' : ClaimOrRefresh } |
  { 'Configure' : Configure } |
  { 'RegisterVote' : RegisterVote } |
  { 'Merge' : Merge } |
  { 'DisburseToNeuron' : DisburseToNeuron } |
  { 'MakeProposal' : Proposal } |
  { 'MergeMaturity' : MergeMaturity } |
  { 'Disburse' : Disburse };
export type Command_1 = { 'Error' : GovernanceError } |
  { 'Spawn' : SpawnResponse } |
  { 'Split' : SpawnResponse } |
  { 'Follow' : {} } |
  { 'ClaimOrRefresh' : ClaimOrRefreshResponse } |
  { 'Configure' : {} } |
  { 'RegisterVote' : {} } |
  { 'Merge' : {} } |
  { 'DisburseToNeuron' : SpawnResponse } |
  { 'MakeProposal' : MakeProposalResponse } |
  { 'MergeMaturity' : MergeMaturityResponse } |
  { 'Disburse' : DisburseResponse };
export type Command_2 = { 'Spawn' : Spawn } |
  { 'Split' : Split } |
  { 'Configure' : Configure } |
  { 'Merge' : Merge } |
  { 'DisburseToNeuron' : DisburseToNeuron } |
  { 'ClaimOrRefreshNeuron' : ClaimOrRefresh } |
  { 'MergeMaturity' : MergeMaturity } |
  { 'Disburse' : Disburse };
export interface Configure { 'operation' : [] | [Operation] }
export interface Disburse {
  'to_account' : [] | [AccountIdentifier],
  'amount' : [] | [Amount],
}
export interface DisburseResponse { 'transfer_block_height' : bigint }
export interface DisburseToNeuron {
  'dissolve_delay_seconds' : bigint,
  'kyc_verified' : boolean,
  'amount_e8s' : bigint,
  'new_controller' : [] | [Principal],
  'nonce' : bigint,
}
export type DissolveState = { 'DissolveDelaySeconds' : bigint } |
  { 'WhenDissolvedTimestampSeconds' : bigint };
export interface ExecuteNnsFunction {
  'nns_function' : number,
  'payload' : Array<number>,
}
export interface Follow { 'topic' : number, 'followees' : Array<NeuronId> }
export interface Followees { 'followees' : Array<NeuronId> }
export interface Governance {
  'default_followees' : Array<[number, Followees]>,
  'wait_for_quiet_threshold_seconds' : bigint,
  'metrics' : [] | [GovernanceCachedMetrics],
  'node_providers' : Array<NodeProvider>,
  'economics' : [] | [NetworkEconomics],
  'latest_reward_event' : [] | [RewardEvent],
  'to_claim_transfers' : Array<NeuronStakeTransfer>,
  'short_voting_period_seconds' : bigint,
  'proposals' : Array<[bigint, ProposalData]>,
  'in_flight_commands' : Array<[bigint, NeuronInFlightCommand]>,
  'neurons' : Array<[bigint, Neuron]>,
  'genesis_timestamp_seconds' : bigint,
}
export interface GovernanceCachedMetrics {
  'not_dissolving_neurons_e8s_buckets' : Array<[bigint, number]>,
  'garbage_collectable_neurons_count' : bigint,
  'neurons_with_invalid_stake_count' : bigint,
  'not_dissolving_neurons_count_buckets' : Array<[bigint, bigint]>,
  'total_supply_icp' : bigint,
  'neurons_with_less_than_6_months_dissolve_delay_count' : bigint,
  'dissolved_neurons_count' : bigint,
  'total_staked_e8s' : bigint,
  'not_dissolving_neurons_count' : bigint,
  'dissolved_neurons_e8s' : bigint,
  'neurons_with_less_than_6_months_dissolve_delay_e8s' : bigint,
  'dissolving_neurons_count_buckets' : Array<[bigint, bigint]>,
  'dissolving_neurons_count' : bigint,
  'dissolving_neurons_e8s_buckets' : Array<[bigint, number]>,
  'community_fund_total_staked_e8s' : bigint,
  'timestamp_seconds' : bigint,
}
export interface GovernanceError {
  'error_message' : string,
  'error_type' : number,
}
export interface IncreaseDissolveDelay {
  'additional_dissolve_delay_seconds' : number,
}
export interface KnownNeuron {
  'id' : [] | [NeuronId],
  'known_neuron_data' : [] | [KnownNeuronData],
}
export interface KnownNeuronData {
  'name' : string,
  'description' : [] | [string],
}
export interface ListKnownNeuronsResponse {
  'known_neurons' : Array<KnownNeuron>,
}
export interface ListNeurons {
  'neuron_ids' : Array<bigint>,
  'include_neurons_readable_by_caller' : boolean,
}
export interface ListNeuronsResponse {
  'neuron_infos' : Array<[bigint, NeuronInfo]>,
  'full_neurons' : Array<Neuron>,
}
export interface ListProposalInfo {
  'include_reward_status' : Array<number>,
  'before_proposal' : [] | [NeuronId],
  'limit' : number,
  'exclude_topic' : Array<number>,
  'include_status' : Array<number>,
}
export interface ListProposalInfoResponse {
  'proposal_info' : Array<ProposalInfo>,
}
export interface MakeProposalResponse { 'proposal_id' : [] | [NeuronId] }
export interface ManageNeuron {
  'id' : [] | [NeuronId],
  'command' : [] | [Command],
  'neuron_id_or_subaccount' : [] | [NeuronIdOrSubaccount],
}
export interface ManageNeuronResponse { 'command' : [] | [Command_1] }
export interface Merge { 'source_neuron_id' : [] | [NeuronId] }
export interface MergeMaturity { 'percentage_to_merge' : number }
export interface MergeMaturityResponse {
  'merged_maturity_e8s' : bigint,
  'new_stake_e8s' : bigint,
}
export interface Motion { 'motion_text' : string }
export interface NetworkEconomics {
  'neuron_minimum_stake_e8s' : bigint,
  'max_proposals_to_keep_per_topic' : number,
  'neuron_management_fee_per_proposal_e8s' : bigint,
  'reject_cost_e8s' : bigint,
  'transaction_fee_e8s' : bigint,
  'neuron_spawn_dissolve_delay_seconds' : bigint,
  'minimum_icp_xdr_rate' : bigint,
  'maximum_node_provider_rewards_e8s' : bigint,
}
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
  'joined_community_fund_timestamp_seconds' : [] | [bigint],
  'dissolve_state' : [] | [DissolveState],
  'followees' : Array<[number, Followees]>,
  'neuron_fees_e8s' : bigint,
  'transfer' : [] | [NeuronStakeTransfer],
  'known_neuron_data' : [] | [KnownNeuronData],
}
export interface NeuronId { 'id' : bigint }
export type NeuronIdOrSubaccount = { 'Subaccount' : Array<number> } |
  { 'NeuronId' : NeuronId };
export interface NeuronInFlightCommand {
  'command' : [] | [Command_2],
  'timestamp' : bigint,
}
export interface NeuronInfo {
  'dissolve_delay_seconds' : bigint,
  'recent_ballots' : Array<BallotInfo>,
  'created_timestamp_seconds' : bigint,
  'state' : number,
  'stake_e8s' : bigint,
  'joined_community_fund_timestamp_seconds' : [] | [bigint],
  'retrieved_at_timestamp_seconds' : bigint,
  'known_neuron_data' : [] | [KnownNeuronData],
  'voting_power' : bigint,
  'age_seconds' : bigint,
}
export interface NeuronStakeTransfer {
  'to_subaccount' : Array<number>,
  'neuron_stake_e8s' : bigint,
  'from' : [] | [Principal],
  'memo' : bigint,
  'from_subaccount' : Array<number>,
  'transfer_timestamp' : bigint,
  'block_height' : bigint,
}
export interface NodeProvider {
  'id' : [] | [Principal],
  'reward_account' : [] | [AccountIdentifier],
}
export type Operation = { 'RemoveHotKey' : RemoveHotKey } |
  { 'AddHotKey' : AddHotKey } |
  { 'StopDissolving' : {} } |
  { 'StartDissolving' : {} } |
  { 'IncreaseDissolveDelay' : IncreaseDissolveDelay } |
  { 'JoinCommunityFund' : {} } |
  { 'SetDissolveTimestamp' : SetDissolveTimestamp };
export interface Proposal {
  'url' : string,
  'title' : [] | [string],
  'action' : [] | [Action],
  'summary' : string,
}
export interface ProposalData {
  'id' : [] | [NeuronId],
  'failure_reason' : [] | [GovernanceError],
  'ballots' : Array<[bigint, Ballot]>,
  'proposal_timestamp_seconds' : bigint,
  'reward_event_round' : bigint,
  'failed_timestamp_seconds' : bigint,
  'reject_cost_e8s' : bigint,
  'latest_tally' : [] | [Tally],
  'decided_timestamp_seconds' : bigint,
  'proposal' : [] | [Proposal],
  'proposer' : [] | [NeuronId],
  'wait_for_quiet_state' : [] | [WaitForQuietState],
  'executed_timestamp_seconds' : bigint,
}
export interface ProposalInfo {
  'id' : [] | [NeuronId],
  'status' : number,
  'topic' : number,
  'failure_reason' : [] | [GovernanceError],
  'ballots' : Array<[bigint, Ballot]>,
  'proposal_timestamp_seconds' : bigint,
  'reward_event_round' : bigint,
  'deadline_timestamp_seconds' : [] | [bigint],
  'failed_timestamp_seconds' : bigint,
  'reject_cost_e8s' : bigint,
  'latest_tally' : [] | [Tally],
  'reward_status' : number,
  'decided_timestamp_seconds' : bigint,
  'proposal' : [] | [Proposal],
  'proposer' : [] | [NeuronId],
  'executed_timestamp_seconds' : bigint,
}
export interface RegisterVote { 'vote' : number, 'proposal' : [] | [NeuronId] }
export interface RemoveHotKey { 'hot_key_to_remove' : [] | [Principal] }
export type Result = { 'Ok' : null } |
  { 'Err' : GovernanceError };
export type Result_1 = { 'Error' : GovernanceError } |
  { 'NeuronId' : NeuronId };
export type Result_2 = { 'Ok' : Neuron } |
  { 'Err' : GovernanceError };
export type Result_3 = { 'Ok' : RewardNodeProviders } |
  { 'Err' : GovernanceError };
export type Result_4 = { 'Ok' : NeuronInfo } |
  { 'Err' : GovernanceError };
export interface RewardEvent {
  'day_after_genesis' : bigint,
  'actual_timestamp_seconds' : bigint,
  'distributed_e8s_equivalent' : bigint,
  'settled_proposals' : Array<NeuronId>,
}
export type RewardMode = { 'RewardToNeuron' : RewardToNeuron } |
  { 'RewardToAccount' : RewardToAccount };
export interface RewardNodeProvider {
  'node_provider' : [] | [NodeProvider],
  'reward_mode' : [] | [RewardMode],
  'amount_e8s' : bigint,
}
export interface RewardNodeProviders { 'rewards' : Array<RewardNodeProvider> }
export interface RewardToAccount { 'to_account' : [] | [AccountIdentifier] }
export interface RewardToNeuron { 'dissolve_delay_seconds' : bigint }
export interface SetDefaultFollowees {
  'default_followees' : Array<[number, Followees]>,
}
export interface SetDissolveTimestamp { 'dissolve_timestamp_seconds' : bigint }
export interface Spawn {
  'percentage_to_spawn' : [] | [number],
  'new_controller' : [] | [Principal],
  'nonce' : [] | [bigint],
}
export interface SpawnResponse { 'created_neuron_id' : [] | [NeuronId] }
export interface Split { 'amount_e8s' : bigint }
export interface Tally {
  'no' : bigint,
  'yes' : bigint,
  'total' : bigint,
  'timestamp_seconds' : bigint,
}
export interface UpdateNodeProvider {
  'reward_account' : [] | [AccountIdentifier],
}
export interface WaitForQuietState {
  'current_deadline_timestamp_seconds' : bigint,
}
export interface _SERVICE {
  'claim_gtc_neurons' : (arg_0: Principal, arg_1: Array<NeuronId>) => Promise<
      Result
    >,
  'claim_or_refresh_neuron_from_account' : (
      arg_0: ClaimOrRefreshNeuronFromAccount,
    ) => Promise<ClaimOrRefreshNeuronFromAccountResponse>,
  'get_full_neuron' : (arg_0: bigint) => Promise<Result_2>,
  'get_full_neuron_by_id_or_subaccount' : (
      arg_0: NeuronIdOrSubaccount,
    ) => Promise<Result_2>,
  'get_monthly_node_provider_rewards' : () => Promise<Result_3>,
  'get_neuron_ids' : () => Promise<Array<bigint>>,
  'get_neuron_info' : (arg_0: bigint) => Promise<Result_4>,
  'get_neuron_info_by_id_or_subaccount' : (
      arg_0: NeuronIdOrSubaccount,
    ) => Promise<Result_4>,
  'get_pending_proposals' : () => Promise<Array<ProposalInfo>>,
  'get_proposal_info' : (arg_0: bigint) => Promise<[] | [ProposalInfo]>,
  'list_known_neurons' : () => Promise<ListKnownNeuronsResponse>,
  'list_neurons' : (arg_0: ListNeurons) => Promise<ListNeuronsResponse>,
  'list_proposals' : (arg_0: ListProposalInfo) => Promise<
      ListProposalInfoResponse
    >,
  'manage_neuron' : (arg_0: ManageNeuron) => Promise<ManageNeuronResponse>,
  'transfer_gtc_neuron' : (arg_0: NeuronId, arg_1: NeuronId) => Promise<Result>,
  'update_node_provider' : (arg_0: UpdateNodeProvider) => Promise<Result>,
}
