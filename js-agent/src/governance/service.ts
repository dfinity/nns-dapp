import type { Principal } from '@dfinity/agent';
import type BigNumber from 'bignumber.js';
export type Action = {
    'ExternalUpdate' : ExternalUpdate
  } |
  { 'ManageNeuron' : ManageNeuron } |
  { 'ApproveKyc' : ApproveKyc } |
  { 'NetworkEconomics' : NetworkEconomics } |
  { 'RewardNodeProvider' : RewardNodeProvider } |
  { 'AddOrRemoveNodeProvider' : AddOrRemoveNodeProvider } |
  { 'Motion' : Motion };
export interface AddHotKey { 'new_hot_key' : [] | [Principal] };
export interface AddOrRemoveNodeProvider { 'change' : [] | [Change] };
export interface Amount { 'doms' : BigNumber };
export interface ApproveKyc { 'principals' : Array<Principal> };
export type AuthzChangeOp = { 'Authorize' : { 'add_self' : boolean } } |
  { 'Deauthorize' : null };
export interface Ballot { 'vote' : number, 'voting_power' : BigNumber };
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
export type Command_1 = { 'Spawn' : SpawnResponse } |
  { 'Split' : SpawnResponse } |
  { 'Follow' : {} } |
  { 'Configure' : {} } |
  { 'RegisterVote' : {} } |
  { 'DisburseToNeuron' : SpawnResponse } |
  { 'MakeProposal' : MakeProposalResponse } |
  { 'Disburse' : DisburseResponse };
export interface Configure { 'operation' : [] | [Operation] };
export interface Disburse {
  'to_subaccount' : Array<number>,
  'to_account' : [] | [Principal],
  'amount' : [] | [Amount],
};
export interface DisburseResponse { 'transfer_block_height' : BigNumber };
export interface DisburseToNeuron {
  'dissolve_delay_seconds' : BigNumber,
  'kyc_verified' : boolean,
  'amount_doms' : BigNumber,
  'new_controller' : [] | [Principal],
  'nonce' : BigNumber,
};
export type DissolveState = { 'DissolveDelaySeconds' : BigNumber } |
  { 'WhenDissolvedTimestampSeconds' : BigNumber };
export interface ExternalUpdate {
  'update_type' : number,
  'payload' : Array<number>,
};
export interface Follow { 'topic' : number, 'followees' : Array<NeuronId> };
export interface Followees { 'followees' : Array<NeuronId> };
export interface GovernanceError {
  'error_message' : string,
  'error_type' : number,
};
export interface IncreaseDissolveDelay {
  'additional_dissolve_delay_seconds' : number,
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
  'reject_cost_doms' : BigNumber,
  'node_reward_xdr_per_billing_period' : BigNumber,
  'manage_neuron_cost_per_proposal_doms' : BigNumber,
  'neuron_minimum_stake_doms' : BigNumber,
  'neuron_spawn_dissolve_delay_seconds' : BigNumber,
  'maximum_node_provider_rewards_xdr_100ths' : BigNumber,
  'minimum_icp_xdr_rate' : BigNumber,
};
export interface Neuron {
  'id' : [] | [NeuronId],
  'controller' : [] | [Principal],
  'recent_ballots' : Array<BallotInfo>,
  'kyc_verified' : boolean,
  'not_for_profit' : boolean,
  'cached_neuron_stake_doms' : BigNumber,
  'created_timestamp_seconds' : BigNumber,
  'maturity_doms_equivalent' : BigNumber,
  'aging_since_timestamp_seconds' : BigNumber,
  'neuron_fees_doms' : BigNumber,
  'hot_keys' : Array<Principal>,
  'account' : Array<number>,
  'dissolve_state' : [] | [DissolveState],
  'followees' : Array<[number, Followees]>,
  'transfer' : [] | [NeuronStakeTransfer],
};
export interface NeuronId { 'id' : BigNumber };
export interface NeuronInfo {
  'dissolve_delay_seconds' : BigNumber,
  'recent_ballots' : Array<BallotInfo>,
  'created_timestamp_seconds' : BigNumber,
  'state' : number,
  'retrieved_at_timestamp_seconds' : BigNumber,
  'voting_power' : BigNumber,
  'age_seconds' : BigNumber,
};
export interface NeuronStakeTransfer {
  'to_subaccount' : Array<number>,
  'from' : [] | [Principal],
  'memo' : BigNumber,
  'neuron_stake_doms' : BigNumber,
  'from_subaccount' : Array<number>,
  'transfer_timestamp' : BigNumber,
  'block_height' : BigNumber,
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
export interface ProposalInfo {
  'id' : [] | [NeuronId],
  'ballots' : Array<[BigNumber, Ballot]>,
  'reject_cost_doms' : BigNumber,
  'proposal_timestamp_seconds' : BigNumber,
  'reward_event_round' : BigNumber,
  'failed_timestamp_seconds' : BigNumber,
  'proposal' : [] | [Proposal],
  'proposer' : [] | [NeuronId],
  'tally_at_decision_time' : [] | [Tally],
  'executed_timestamp_seconds' : BigNumber,
};
export interface RegisterVote { 'vote' : number, 'proposal' : [] | [NeuronId] };
export interface RemoveHotKey { 'hot_key_to_remove' : [] | [Principal] };
export type Result = { 'Ok' : BigNumber } |
  { 'Err' : GovernanceError };
export type Result_1 = { 'Ok' : Neuron } |
  { 'Err' : GovernanceError };
export type Result_2 = { 'Ok' : NeuronInfo } |
  { 'Err' : GovernanceError };
export type Result_3 = { 'Ok' : ManageNeuronResponse } |
  { 'Err' : GovernanceError };
export interface RewardNodeProvider {
  'node_provider' : [] | [NodeProvider],
  'xdr_amount_100ths' : BigNumber,
};
export interface Spawn { 'new_controller' : [] | [Principal] };
export interface SpawnResponse { 'created_neuron_id' : [] | [NeuronId] };
export interface Split { 'amount_doms' : BigNumber };
export interface Tally {
  'no' : BigNumber,
  'yes' : BigNumber,
  'total' : BigNumber,
  'timestamp_seconds' : BigNumber,
};
export default interface _SERVICE {
  'claim_neuron' : (
      arg_0: Array<number>,
      arg_1: BigNumber,
      arg_2: BigNumber,
    ) => Promise<Result>,
  'current_authz' : () => Promise<CanisterAuthzInfo>,
  'execute_eligible_proposals' : () => Promise<undefined>,
  'get_finalized_proposals' : () => Promise<Array<ProposalInfo>>,
  'get_full_neuron' : (arg_0: BigNumber) => Promise<Result_1>,
  'get_neuron_ids' : () => Promise<Array<BigNumber>>,
  'get_neuron_info' : (arg_0: BigNumber) => Promise<Result_2>,
  'get_pending_proposals' : () => Promise<Array<ProposalInfo>>,
  'get_proposal_info' : (arg_0: BigNumber) => Promise<[] | [ProposalInfo]>,
  'manage_neuron' : (arg_0: ManageNeuron) => Promise<Result_3>,
  'submit_proposal' : (
      arg_0: BigNumber,
      arg_1: Proposal,
      arg_2: Principal,
    ) => Promise<BigNumber>,
  'update_authz' : (arg_0: Array<MethodAuthzChange>) => Promise<undefined>,
};
