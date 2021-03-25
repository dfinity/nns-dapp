import { bigNumberToBigInt } from "../converters";
import {
    Action,
    Amount,
    Ballot,
    Change,
    Command,
    NeuronId,
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
    Change as RawChange,
    Command as RawCommand,
    NeuronId as RawNeuronId,
    NodeProvider as RawNodeProvider,
    Operation as RawOperation,
    Proposal as RawProposal,
    ProposalInfo as RawProposalInfo,
    Tally as RawTally
} from "./rawService";

class ResponseConverter {
    convertGetPendingProposalsResponse(response: Array<RawProposalInfo>) : Array<ProposalInfo> {
        return response.map(p => ({
            id: p.id.length ? this.convertNeuronId(p.id[0]) : null,
            ballots: p.ballots.map(b => [bigNumberToBigInt(b[0]), this.convertBallot(b[1])]),
            rejectCostDoms: bigNumberToBigInt(p.reject_cost_doms),
            proposalTimestampSeconds: bigNumberToBigInt(p.proposal_timestamp_seconds),
            rewardEventRound: bigNumberToBigInt(p.reward_event_round),
            failedTimestampSeconds: bigNumberToBigInt(p.failed_timestamp_seconds),
            proposal: p.proposal.length ? this.convertProposal(p.proposal[0]) : null,
            proposer: p.proposer.length ? this.convertNeuronId(p.proposer[0]) : null,
            tallyAtDecisionTime: p.tally_at_decision_time.length ? this.convertTally(p.tally_at_decision_time[0]): null,
            executedTimestampSeconds: bigNumberToBigInt(p.executed_timestamp_seconds),
        }));
    }

    convertNeuronId(neuronId: RawNeuronId) : NeuronId {
        return {
            id: bigNumberToBigInt(neuronId.id)
        };
    }

    convertBallot(ballot: RawBallot) : Ballot {
        return {
            vote: ballot.vote,
            votingPower: bigNumberToBigInt(ballot.voting_power)
        };
    }

    convertProposal(proposal: RawProposal) : Proposal {
        return {
            url: proposal.url,
            action: proposal.action.length ? this.convertAction(proposal.action[0]) : null,
            summary: proposal.summary
        }
    }

    convertAction(action: RawAction) : Action {
        if ("ExternalUpdate" in action) {
            const externalUpdate = action.ExternalUpdate;
            return {
                ExternalUpdate: {
                    updateType: externalUpdate.update_type,
                    payload: externalUpdate.payload
                }
            }
        }
        if ("ManageNeuron" in action) {
            const manageNeuron = action.ManageNeuron;
            return {
                ManageNeuron: {
                    id: manageNeuron.id.length ? this.convertNeuronId(manageNeuron.id[0]) : null,
                    command: manageNeuron.command.length ? this.convertCommand(manageNeuron.command[0]) : null
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
                    nodeProvider : rewardNodeProvider.node_provider.length ? this.convertNodeProvider(rewardNodeProvider.node_provider[0]) : null,
                    xdrAmount100ths : bigNumberToBigInt(rewardNodeProvider.xdr_amount_100ths)
                }
            }
        }
        if ("AddOrRemoveNodeProvider" in action) {
            const addOrRemoveNodeProvider = action.AddOrRemoveNodeProvider;
            return {
                AddOrRemoveNodeProvider: {
                    change: addOrRemoveNodeProvider.change.length ? this.convertChange(addOrRemoveNodeProvider.change[0]) : null
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

    convertTally(tally: RawTally) : Tally {
        return {
            no: bigNumberToBigInt(tally.no),
            yes: bigNumberToBigInt(tally.yes),
            total: bigNumberToBigInt(tally.total),
            timestampSeconds: bigNumberToBigInt(tally.timestamp_seconds)
        }
    }

    convertCommand(command: RawCommand) : Command {
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
                    followees: follow.followees.map(this.convertNeuronId)
                }
            }
        }
        if ("Configure" in command) {
            const configure = command.Configure;
            return {
                Configure: {
                    operation: configure.operation.length ? this.convertOperation(configure.operation[0]) : null
                }
            }
        }
        if ("RegisterVote" in command) {
            const registerVote = command.RegisterVote;
            return {
                RegisterVote: {
                    vote: registerVote.vote,
                    proposal: registerVote.proposal.length ? this.convertNeuronId(registerVote.proposal[0]) : null
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
                    action: makeProposal.action.length ? this.convertAction(makeProposal.action[0]) : null,
                    summary: makeProposal.summary
                }
            }
        }
        if ("Disburse" in command) {
            const disburse = command.Disburse;
            return {
                Disburse: {
                    toSubaccount: disburse.to_subaccount,
                    toAccount: disburse.to_account.length ? disburse.to_account[0] : null,
                    amount: disburse.amount.length ? this.convertAmount(disburse.amount[0]) : null
                }
            }
        }
        this.throwUnrecognisedTypeError("command", command);
    }

    convertOperation(operation: RawOperation) : Operation {
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

    convertChange(change: RawChange) : Change {
        if ("ToRemove" in change) {
            return {
                ToRemove: this.convertNodeProvider(change.ToRemove)
            }
        }
        if ("ToAdd" in change) {
            return {
                ToAdd: this.convertNodeProvider(change.ToAdd)
            }
        }
        this.throwUnrecognisedTypeError("change", change);
    }

    convertNodeProvider(nodeProvider: RawNodeProvider) : NodeProvider {
        return {
            id: nodeProvider.id.length ? nodeProvider.id[0] : null
        }
    }

    convertAmount(amount: RawAmount) : Amount {
        return {
            doms: bigNumberToBigInt(amount.doms)
        }
    }

    throwUnrecognisedTypeError(name: string, value: any) {
        throw new Error(`Unrecognised ${name} type - ${JSON.stringify(value)}`);
    }
}

const converter = new ResponseConverter();

export default converter;
