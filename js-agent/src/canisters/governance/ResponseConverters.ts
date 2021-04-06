import BigNumber from "bignumber.js";
import { arrayOfNumberToArrayBuffer, bigNumberToBigInt, toSubAccountId } from "../converter";
import { Doms } from "../ledger/model";
import {
    Action,
    Ballot,
    BallotInfo,
    Change,
    ClaimNeuronResponse,
    Command,
    DisburseResult,
    DisburseToNeuronResult,
    DissolveState,
    EmptyResponse,
    Followees,
    GetNeuronInfoResponse,
    ListProposalsResponse,
    MakeProposalResult,
    Neuron,
    NeuronId,
    NeuronInfo,
    NeuronStakeTransfer,
    NodeProvider,
    Operation,
    Proposal,
    ProposalInfo,
    SpawnResult,
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
    Result_3,
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
    Tally as RawTally,
    ListProposalInfoResponse
} from "./rawService";

export default class ResponseConverters {
    public toProposalInfo = (proposalInfo: RawProposalInfo) : ProposalInfo => {
        return {
            id: proposalInfo.id.length ? this.toNeuronId(proposalInfo.id[0]) : null,
            ballots: proposalInfo.ballots.map(b => this.toBallot(b[0], b[1])),
            rejectCost: bigNumberToBigInt(proposalInfo.reject_cost_doms),
            proposalTimestampSeconds: bigNumberToBigInt(proposalInfo.proposal_timestamp_seconds),
            rewardEventRound: bigNumberToBigInt(proposalInfo.reward_event_round),
            failedTimestampSeconds: bigNumberToBigInt(proposalInfo.failed_timestamp_seconds),
            decidedTimestampSeconds: bigNumberToBigInt(proposalInfo.decided_timestamp_seconds),
            proposal: this.toProposal(proposalInfo.proposal[0]),
            proposer: this.toNeuronId(proposalInfo.proposer[0]),
            latestTally: this.toTally(proposalInfo.latest_tally[0]),
            executedTimestampSeconds: bigNumberToBigInt(proposalInfo.executed_timestamp_seconds),
        };
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
        return this.handleErrorResult(response);
    }

    public toListProposalsResponse = (response: ListProposalInfoResponse) : ListProposalsResponse => {
        return {
            proposals: response.proposal_info.map(this.toProposalInfo)
        };
    }

    public toEmptyResponse = (response: Result_3) : EmptyResponse => {
        if ("Ok" in response) {
            return {
                Ok: null
            }
        }
        return this.handleErrorResult(response);
    }

    public toSpawnResult = (response: Result_3) : SpawnResult => {
        if ("Ok" in response) {
            const command = (response.Ok.command)[0];
            if ("Spawn" in command) {
                return {
                    Ok: {
                        createdNeuronId: bigNumberToBigInt((command.Spawn.created_neuron_id)[0].id)
                    }
                };    
            }
        }
        return this.handleErrorResult(response);
    } 

    public toDisburseResult = (response: Result_3) : DisburseResult => {
        if ("Ok" in response) {
            const command = (response.Ok.command)[0];
            if ("Disburse" in command) {
                return {
                    Ok: {
                        transferBlockHeight: bigNumberToBigInt(command.Disburse.transfer_block_height)
                    }
                };    
            }
        }
        return this.handleErrorResult(response);
    } 

    public toDisburseToNeuronResult = (response: Result_3) : DisburseToNeuronResult => {
        if ("Ok" in response) {
            const command = (response.Ok.command)[0];
            if ("Spawn" in command) {
                return {
                    Ok: {
                        createdNeuronId: bigNumberToBigInt((command.Spawn.created_neuron_id)[0].id)
                    }
                };    
            }
        }
        return this.handleErrorResult(response);
    } 

    public toMakeProposalResult = (response: Result_3) : MakeProposalResult => {
        if ("Ok" in response) {
            const command = (response.Ok.command)[0];
            if ("MakeProposal" in command) {
                return {
                    Ok: {
                        proposalId: bigNumberToBigInt((command.MakeProposal.proposal_id)[0].id)
                    }
                };    
            }
        }
        return this.handleErrorResult(response);
    } 

    private handleErrorResult(response: Result_3) : any {
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
            id: this.toNeuronId(neuron.id[0]),
            controller: neuron.controller[0],
            recentBallots: neuron.recent_ballots.map(this.toBallotInfo),
            kycVerified: neuron.kyc_verified,
            notForProfit: neuron.not_for_profit,
            cachedNeuronStake: bigNumberToBigInt(neuron.cached_neuron_stake_doms),
            createdTimestampSeconds: bigNumberToBigInt(neuron.created_timestamp_seconds),
            maturityDomsEquivalent: bigNumberToBigInt(neuron.maturity_doms_equivalent),
            agingSinceTimestampSeconds: bigNumberToBigInt(neuron.aging_since_timestamp_seconds),
            neuronFees: bigNumberToBigInt(neuron.neuron_fees_doms),
            hotKeys: neuron.hot_keys,
            accountPrincipal: arrayOfNumberToArrayBuffer(neuron.account),
            dissolveState: this.toDissolveState(neuron.dissolve_state[0]),
            followees: neuron.followees.map(([n, f]) => this.toFollowees(n, f)),
            transfer: this.toNeuronStakeTransfer(neuron.transfer[0])
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

    private toFollowees = (topic: number, followees: RawFollowees) : Followees => {
        return {
            topic: topic,
            followees: followees.followees.map(this.toNeuronId)
        };
    }

    private toNeuronStakeTransfer = (neuronStakeTransfer: RawNeuronStakeTransfer) : NeuronStakeTransfer => {
        return {
            toSubaccount: arrayOfNumberToArrayBuffer(neuronStakeTransfer.to_subaccount),
            from: neuronStakeTransfer.from ? neuronStakeTransfer.from[0] : null,
            memo: bigNumberToBigInt(neuronStakeTransfer.memo),
            neuronStake: bigNumberToBigInt(neuronStakeTransfer.neuron_stake_doms),
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
        return bigNumberToBigInt(neuronId.id);
    }

    private toBallot = (neuronId: BigNumber, ballot: RawBallot) : Ballot => {
        return {
            neuronId: bigNumberToBigInt(neuronId),
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
                    rejectCost: bigNumberToBigInt(networkEconomics.reject_cost_doms),
                    manageNeuronCostPerProposal: bigNumberToBigInt(networkEconomics.manage_neuron_cost_per_proposal_doms),
                    neuronMinimumStake: bigNumberToBigInt(networkEconomics.neuron_minimum_stake_doms),
                    maximumNodeProviderRewards: bigNumberToBigInt(networkEconomics.maximum_node_provider_rewards_doms),
                    neuronSpawnDissolveDelaySeconds: bigNumberToBigInt(networkEconomics.neuron_spawn_dissolve_delay_seconds),
                }
            }
        }
        if ("RewardNodeProvider" in action) {
            const rewardNodeProvider = action.RewardNodeProvider;
            return {
                RewardNodeProvider: {
                    nodeProvider : rewardNodeProvider.node_provider.length ? this.toNodeProvider(rewardNodeProvider.node_provider[0]) : null,
                    amount : bigNumberToBigInt(rewardNodeProvider.amount_doms)
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
                    amount: bigNumberToBigInt(split.amount_doms)
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
                    amount: bigNumberToBigInt(disburseToNeuron.amount_doms),
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
                    toSubaccountId: toSubAccountId(disburse.to_subaccount),
                    amount: disburse.amount.length ? this.toDoms(disburse.amount[0]) : null
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

    private toDoms = (amount: RawAmount) : Doms => {
        return bigNumberToBigInt(amount.doms);
    }

    private throwUnrecognisedTypeError = (name: string, value: any) => {
        throw new Error(`Unrecognised ${name} type - ${JSON.stringify(value)}`);
    }
}
