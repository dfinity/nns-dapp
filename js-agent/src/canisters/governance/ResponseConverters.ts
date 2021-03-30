import BigNumber from "bignumber.js";
import { arrayOfNumberToArrayBuffer, bigNumberToBigInt } from "../converters";
import {
    Action,
    Amount,
    Ballot,
    BallotInfo,
    Change,
    ClaimNeuronResponse,
    Command,
    DissolveState,
    Followees,
    GetFullNeuronResponse,
    GetNeuronInfoResponse,
    ManageNeuronResponse,
    ManageNeuronResponseCommand,
    Neuron,
    NeuronId,
    NeuronInfo,
    NeuronStakeTransfer,
    NodeProvider,
    Operation,
    Proposal,
    ProposalInfo,
    Tally
} from "./model";
import {
    Action as RawAction,
    Amount as RawAmount,
    Ballot as RawBallot,
    BallotInfo as RawBallotInfo,
    Change as RawChange,
    Command as RawCommand,
    DissolveState as RawDissolveState,
    Followees as RawFollowees,
    ManageNeuronResponse as RawManageNeuronResponse,
    ManageNeuronResponseCommand as RawManageNeuronResponseCommand,
    Neuron as RawNeuron,
    NeuronId as RawNeuronId,
    NeuronInfo as RawNeuronInfo,
    NeuronStakeTransfer as RawNeuronStakeTransfer,
    NodeProvider as RawNodeProvider,
    Operation as RawOperation,
    Proposal as RawProposal,
    ProposalInfo as RawProposalInfo,
    Result,
    Result_1,
    Result_2,
    Tally as RawTally
} from "./rawService";

export default class ResponseConverters {
    public toProposalInfo = (proposalInfo: RawProposalInfo) : ProposalInfo => {
        return {
            id: proposalInfo.id.length ? this.toNeuronId(proposalInfo.id[0]) : null,
            ballots: proposalInfo.ballots.map(b => [bigNumberToBigInt(b[0]), this.toBallot(b[1])]),
            rejectCostDoms: bigNumberToBigInt(proposalInfo.reject_cost_doms),
            proposalTimestampSeconds: bigNumberToBigInt(proposalInfo.proposal_timestamp_seconds),
            rewardEventRound: bigNumberToBigInt(proposalInfo.reward_event_round),
            failedTimestampSeconds: bigNumberToBigInt(proposalInfo.failed_timestamp_seconds),
            proposal: proposalInfo.proposal.length ? this.toProposal(proposalInfo.proposal[0]) : null,
            proposer: proposalInfo.proposer.length ? this.toNeuronId(proposalInfo.proposer[0]) : null,
            tallyAtDecisionTime: proposalInfo.tally_at_decision_time.length ? this.toTally(proposalInfo.tally_at_decision_time[0]): null,
            executedTimestampSeconds: bigNumberToBigInt(proposalInfo.executed_timestamp_seconds),
        };
    }

    public toManageNeuronResponse = (response: RawManageNeuronResponse) : ManageNeuronResponse => {
        if ("Ok" in response) {
            return {
                Ok: {
                    command: response.Ok.command.length ? this.toManageNeuronResponseCommand(response.Ok.command[0]) : null
                }
            }
        }
        if ("Err" in response) {
            return {
                Err: {
                    errorMessage: response.Err.error_message,
                    errorType: response.Err.error_type
                }
            }
        }
        this.throwUnrecognisedTypeError("response", response);
    }

    public toNeuronInfoResponse = (neuronId: BigNumber, neuronInfoResponse: Result_2, fullNeuronResponse: Result_1) : GetNeuronInfoResponse => {
        let fullNeuron: Neuron;
        if ("Ok" in fullNeuronResponse) {
            fullNeuron = this.toNeuron(fullNeuronResponse.Ok);
        } else if ("Err" in fullNeuronResponse) {
            return {
                Err: {
                    errorMessage: fullNeuronResponse.Err.error_message,
                    errorType: fullNeuronResponse.Err.error_type
                }
            };
        } else {
            this.throwUnrecognisedTypeError("response", fullNeuronResponse);
        }
        if ("Ok" in neuronInfoResponse) {
            return {
                Ok: this.toNeuronInfo(neuronId, neuronInfoResponse.Ok, fullNeuron)
            };
        } else if ("Err" in neuronInfoResponse) {
            return {
                Err: {
                    errorMessage: neuronInfoResponse.Err.error_message,
                    errorType: neuronInfoResponse.Err.error_type
                }
            };
        }
        this.throwUnrecognisedTypeError("response", neuronInfoResponse);
    }

    public toClaimNeuronResponse = (response: Result) : ClaimNeuronResponse => {
        if ("Ok" in response) {
            return {
                Ok: bigNumberToBigInt(response.Ok)
            }
        }
        if ("Err" in response) {
            return {
                Err: {
                    errorMessage: response.Err.error_message,
                    errorType: response.Err.error_type
                }
            }
        }
        this.throwUnrecognisedTypeError("response", response);
    }

    private toNeuron = (neuron: RawNeuron) : Neuron => {
        return {
            id: neuron.id.length ? this.toNeuronId(neuron.id[0]) : null,
            controller: neuron.controller.length ? neuron.controller[0] : null,
            recentBallots: neuron.recent_ballots.map(this.toBallotInfo),
            kycVerified: neuron.kyc_verified,
            notForProfit: neuron.not_for_profit,
            cachedNeuronStakeDoms: bigNumberToBigInt(neuron.cached_neuron_stake_doms),
            createdTimestampSeconds: bigNumberToBigInt(neuron.created_timestamp_seconds),
            maturityDomsEquivalent: bigNumberToBigInt(neuron.maturity_doms_equivalent),
            agingSinceTimestampSeconds: bigNumberToBigInt(neuron.aging_since_timestamp_seconds),
            neuronFeesDoms: bigNumberToBigInt(neuron.neuron_fees_doms),
            hotKeys: neuron.hot_keys,
            account: arrayOfNumberToArrayBuffer(neuron.account),
            dissolveState: neuron.dissolve_state.length ? this.toDissolveState(neuron.dissolve_state[0]) : null,
            followees: neuron.followees.map(([n, f]) => [n, this.toFollowees(f)]),
            transfer: neuron.transfer.length ? this.toNeuronStakeTransfer(neuron.transfer[0]) : null
        };
    }

    private toBallotInfo = (ballotInfo: RawBallotInfo) : BallotInfo => {
        return {
            vote: ballotInfo.vote,
            proposalId: ballotInfo.proposal_id.length ? this.toNeuronId(ballotInfo.proposal_id[0]) : null,        
        }
    }
    
    private toDissolveState = (dissolveState: RawDissolveState) : DissolveState => {
        if ("DissolveDelaySeconds" in dissolveState) {
            return {
                DissolveDelaySeconds: bigNumberToBigInt(dissolveState.DissolveDelaySeconds)
            }
        } else {
            return {
                WhenDissolvedTimestampSeconds: bigNumberToBigInt(dissolveState.WhenDissolvedTimestampSeconds)
            }
        }
    }

    private toFollowees = (followees: RawFollowees) : Followees => {
        return {
            followees: followees.followees.map(this.toNeuronId)
        };
    }

    private toNeuronStakeTransfer = (neuronStakeTransfer: RawNeuronStakeTransfer) : NeuronStakeTransfer => {
        return {
            toSubaccount: arrayOfNumberToArrayBuffer(neuronStakeTransfer.to_subaccount),
            from: neuronStakeTransfer.from ? neuronStakeTransfer.from[0] : null,
            memo: bigNumberToBigInt(neuronStakeTransfer.memo),
            neuronStakeDoms: bigNumberToBigInt(neuronStakeTransfer.neuron_stake_doms),
            fromSubaccount: arrayOfNumberToArrayBuffer(neuronStakeTransfer.from_subaccount),
            transferTimestamp: bigNumberToBigInt(neuronStakeTransfer.transfer_timestamp),
            blockHeight: bigNumberToBigInt(neuronStakeTransfer.block_height)                    
        };        
    }

    private toNeuronInfo = (neuronId: BigNumber, neuronInfo: RawNeuronInfo, fullNeuron: Neuron) : NeuronInfo => {
        return {
            neuronId: bigNumberToBigInt(neuronId),
            dissolveDelaySeconds: bigNumberToBigInt(neuronInfo.dissolve_delay_seconds),
            recentBallots: neuronInfo.recent_ballots.map(this.toBallotInfo),
            createdTimestampSeconds: bigNumberToBigInt(neuronInfo.created_timestamp_seconds),
            state: neuronInfo.state,
            retrievedAtTimestampSeconds: bigNumberToBigInt(neuronInfo.retrieved_at_timestamp_seconds),
            votingPower: bigNumberToBigInt(neuronInfo.voting_power),
            ageSeconds: bigNumberToBigInt(neuronInfo.age_seconds),
            fullNeuron: fullNeuron
        };
    }

    private toNeuronId = (neuronId: RawNeuronId) : NeuronId => {
        return {
            id: bigNumberToBigInt(neuronId.id)
        };
    }

    private toBallot = (ballot: RawBallot) : Ballot => {
        return {
            vote: ballot.vote,
            votingPower: bigNumberToBigInt(ballot.voting_power)
        };
    }

    private toProposal = (proposal: RawProposal) : Proposal => {
        return {
            url: proposal.url,
            action: proposal.action.length ? this.toAction(proposal.action[0]) : null,
            summary: proposal.summary
        }
    }

    private toAction = (action: RawAction) : Action => {
        if ("ExternalUpdate" in action) {
            const externalUpdate = action.ExternalUpdate;
            return {
                ExternalUpdate: {
                    updateType: externalUpdate.update_type,
                    payload: arrayOfNumberToArrayBuffer(externalUpdate.payload)
                }
            }
        }
        if ("ManageNeuron" in action) {
            const manageNeuron = action.ManageNeuron;
            return {
                ManageNeuron: {
                    id: manageNeuron.id.length ? this.toNeuronId(manageNeuron.id[0]) : null,
                    command: manageNeuron.command.length ? this.toCommand(manageNeuron.command[0]) : null
                }
            }
        }
        if ("ApproveKyc" in action) {
            const approveKyc = action.ApproveKyc;
            return {
                ApproveKyc: {
                    principals: approveKyc.principals
                }
            }
        }
        if ("NetworkEconomics" in action) {
            const networkEconomics = action.NetworkEconomics;
            return {
                NetworkEconomics: {
                    rejectCostDoms: bigNumberToBigInt(networkEconomics.reject_cost_doms),
                    nodeRewardXdrPerBillingPeriod: bigNumberToBigInt(networkEconomics.node_reward_xdr_per_billing_period),
                    manageNeuronCostPerProposalDoms: bigNumberToBigInt(networkEconomics.manage_neuron_cost_per_proposal_doms),
                    neuronMinimumStakeDoms: bigNumberToBigInt(networkEconomics.neuron_minimum_stake_doms),
                    neuronSpawnDissolveDelaySeconds: bigNumberToBigInt(networkEconomics.neuron_spawn_dissolve_delay_seconds),
                    maximumNodeProviderRewardsXdr_100ths: bigNumberToBigInt(networkEconomics.maximum_node_provider_rewards_xdr_100ths),
                    minimumIcpXdrRate: bigNumberToBigInt(networkEconomics.minimum_icp_xdr_rate)
                }
            }
        }
        if ("RewardNodeProvider" in action) {
            const rewardNodeProvider = action.RewardNodeProvider;
            return {
                RewardNodeProvider: {
                    nodeProvider : rewardNodeProvider.node_provider.length ? this.toNodeProvider(rewardNodeProvider.node_provider[0]) : null,
                    xdrAmount100ths : bigNumberToBigInt(rewardNodeProvider.xdr_amount_100ths)
                }
            }
        }
        if ("AddOrRemoveNodeProvider" in action) {
            const addOrRemoveNodeProvider = action.AddOrRemoveNodeProvider;
            return {
                AddOrRemoveNodeProvider: {
                    change: addOrRemoveNodeProvider.change.length ? this.toChange(addOrRemoveNodeProvider.change[0]) : null
                }
            }
        }
        if ("Motion" in action) {
            const motion = action.Motion;
            return {
                Motion: {
                    motionText: motion.motion_text
                }
            }
        }
        this.throwUnrecognisedTypeError("action", action);
    }

    private toTally = (tally: RawTally) : Tally => {
        return {
            no: bigNumberToBigInt(tally.no),
            yes: bigNumberToBigInt(tally.yes),
            total: bigNumberToBigInt(tally.total),
            timestampSeconds: bigNumberToBigInt(tally.timestamp_seconds)
        }
    }

    private toCommand = (command: RawCommand) : Command => {
        if ("Spawn" in command) {
            const spawn = command.Spawn;
            return {
                Spawn: {
                    newController: spawn.new_controller.length ? spawn.new_controller[0] : null
                }
            }
        }
        if ("Split" in command) {
            const split = command.Split;
            return {
                Split: {
                    amountDoms: bigNumberToBigInt(split.amount_doms)
                }
            }
        }
        if ("Follow" in command) {
            const follow = command.Follow;
            return {
                Follow: {
                    topic: follow.topic,
                    followees: follow.followees.map(this.toNeuronId)
                }
            }
        }
        if ("Configure" in command) {
            const configure = command.Configure;
            return {
                Configure: {
                    operation: configure.operation.length ? this.toOperation(configure.operation[0]) : null
                }
            }
        }
        if ("RegisterVote" in command) {
            const registerVote = command.RegisterVote;
            return {
                RegisterVote: {
                    vote: registerVote.vote,
                    proposal: registerVote.proposal.length ? this.toNeuronId(registerVote.proposal[0]) : null
                }
            }
        }
        if ("DisburseToNeuron" in command) {
            const disburseToNeuron = command.DisburseToNeuron;
            return {
                DisburseToNeuron: {
                    dissolveDelaySeconds: bigNumberToBigInt(disburseToNeuron.dissolve_delay_seconds),
                    kycVerified: disburseToNeuron.kyc_verified,
                    amountDoms: bigNumberToBigInt(disburseToNeuron.amount_doms),
                    newController: disburseToNeuron.new_controller.length ? disburseToNeuron.new_controller[0] : null,
                    nonce: bigNumberToBigInt(disburseToNeuron.nonce)
                }
            }
        }
        if ("MakeProposal" in command) {
            const makeProposal = command.MakeProposal;
            return {
                MakeProposal: {
                    url: makeProposal.url,
                    action: makeProposal.action.length ? this.toAction(makeProposal.action[0]) : null,
                    summary: makeProposal.summary
                }
            }
        }
        if ("Disburse" in command) {
            const disburse = command.Disburse;
            return {
                Disburse: {
                    toSubaccount: arrayOfNumberToArrayBuffer(disburse.to_subaccount),
                    toAccount: disburse.to_account.length ? disburse.to_account[0] : null,
                    amount: disburse.amount.length ? this.toAmount(disburse.amount[0]) : null
                }
            }
        }
        this.throwUnrecognisedTypeError("command", command);
    }

    private toManageNeuronResponseCommand = (command: RawManageNeuronResponseCommand) : ManageNeuronResponseCommand => {
        if ("Spawn" in command) {
            const spawn = command.Spawn;
            return {
                Spawn: {
                    createdNeuronId: spawn.created_neuron_id.length ? this.toNeuronId(spawn.created_neuron_id[0]) : null
                }
            }
        }
        if ("Split" in command) {
            const split = command.Split;
            return {
                Split: {
                    createdNeuronId: split.created_neuron_id.length ? this.toNeuronId(split.created_neuron_id[0]) : null
                }
            }
        }
        if ("Follow" in command) {
            return {
                Follow: {}
            }
        }
        if ("Configure" in command) {
            return {
                Configure: {}
            }
        }
        if ("RegisterVote" in command) {
            return {
                RegisterVote: {}
            }
        }
        if ("DisburseToNeuron" in command) {
            const disburseToNeuron = command.DisburseToNeuron;
            return {
                DisburseToNeuron: {
                    createdNeuronId: disburseToNeuron.created_neuron_id.length ? this.toNeuronId(disburseToNeuron.created_neuron_id[0]) : null
                }
            }
        }
        if ("MakeProposal" in command) {
            const makeProposal = command.MakeProposal;
            return {
                MakeProposal: {
                    proposalId: makeProposal.proposal_id.length ? this.toNeuronId(makeProposal.proposal_id[0]) : null
                }
            }
        }
        if ("Disburse" in command) {
            const disburse = command.Disburse;
            return {
                Disburse: {
                    transferBlockHeight: bigNumberToBigInt(disburse.transfer_block_height)
                }
            }
        }
        this.throwUnrecognisedTypeError("command", command);
    }

    private toOperation = (operation: RawOperation) : Operation => {
        if ("RemoveHotKey" in operation) {
            const removeHotKey = operation.RemoveHotKey;
            return {
                RemoveHotKey: {
                    hotKeyToRemove: removeHotKey.hot_key_to_remove.length ? removeHotKey.hot_key_to_remove[0] : null
                }
            }
        }
        if ("AddHotKey" in operation) {
            const addHotKey = operation.AddHotKey;
            return {
                AddHotKey: {
                    newHotKey: addHotKey.new_hot_key.length ? addHotKey.new_hot_key[0] : null
                }
            }
        }
        if ("StopDissolving" in operation) {
            return {
                StopDissolving: {}
            }
        }
        if ("StartDissolving" in operation) {
            return {
                StartDissolving: {}
            }
        }
        if ("IncreaseDissolveDelay" in operation) {
            const increaseDissolveDelay = operation.IncreaseDissolveDelay;
            return {
                IncreaseDissolveDelay: {
                    additionalDissolveDelaySeconds: increaseDissolveDelay.additional_dissolve_delay_seconds
                }
            }
        }
        this.throwUnrecognisedTypeError("operation", operation);
    }

    private toChange = (change: RawChange) : Change => {
        if ("ToRemove" in change) {
            return {
                ToRemove: this.toNodeProvider(change.ToRemove)
            }
        }
        if ("ToAdd" in change) {
            return {
                ToAdd: this.toNodeProvider(change.ToAdd)
            }
        }
        this.throwUnrecognisedTypeError("change", change);
    }

    private toNodeProvider = (nodeProvider: RawNodeProvider) : NodeProvider => {
        return {
            id: nodeProvider.id.length ? nodeProvider.id[0] : null
        }
    }

    private toAmount = (amount: RawAmount) : Amount => {
        return {
            doms: bigNumberToBigInt(amount.doms)
        }
    }

    private throwUnrecognisedTypeError = (name: string, value: any) => {
        throw new Error(`Unrecognised ${name} type - ${JSON.stringify(value)}`);
    }
}
