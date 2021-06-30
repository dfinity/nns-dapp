import { Principal } from "@dfinity/principal";
import { accountIdentifierFromBytes, arrayOfNumberToArrayBuffer } from "../converter";
import { AccountIdentifier, E8s, NeuronId } from "../common/types";
import {
    Action,
    Ballot,
    BallotInfo,
    Change,
    Command,
    DisburseResponse,
    DisburseToNeuronResponse,
    DissolveState,
    Followees,
    ListProposalsResponse,
    MakeProposalResponse,
    Neuron,
    NeuronInfo,
    NeuronStakeTransfer,
    NodeProvider,
    Operation,
    Proposal,
    ProposalInfo,
    RewardMode,
    SpawnResponse,
    Tally
} from "./model";
import {
    AccountIdentifier as RawAccountIdentifier,
    Action as RawAction,
    Amount as RawAmount,
    Ballot as RawBallot,
    BallotInfo as RawBallotInfo,
    Change as RawChange,
    Command as RawCommand,
    DissolveState as RawDissolveState,
    Followees as RawFollowees,
    ListNeuronsResponse as RawListNeuronsResponse,
    ListProposalInfoResponse as RawListProposalInfoResponse,
    ManageNeuronResponse as RawManageNeuronResponse,
    Neuron as RawNeuron,
    NeuronId as RawNeuronId,
    NeuronInfo as RawNeuronInfo,
    NeuronStakeTransfer as RawNeuronStakeTransfer,
    NodeProvider as RawNodeProvider,
    Operation as RawOperation,
    Proposal as RawProposal,
    ProposalInfo as RawProposalInfo,
    RewardMode as RawRewardMode,
    Tally as RawTally,
} from "./rawService";

export default class ResponseConverters {
    public toProposalInfo = (proposalInfo: RawProposalInfo) : ProposalInfo => {
        return {
            id: proposalInfo.id.length ? this.toNeuronId(proposalInfo.id[0]) : null,
            ballots: proposalInfo.ballots.map(b => this.toBallot(b[0], b[1])),
            rejectCost: proposalInfo.reject_cost_e8s,
            proposalTimestampSeconds: proposalInfo.proposal_timestamp_seconds,
            rewardEventRound: proposalInfo.reward_event_round,
            failedTimestampSeconds: proposalInfo.failed_timestamp_seconds,
            decidedTimestampSeconds: proposalInfo.decided_timestamp_seconds,
            proposal: this.toProposal(proposalInfo.proposal[0]),
            proposer: this.toNeuronId(proposalInfo.proposer[0]),
            latestTally: this.toTally(proposalInfo.latest_tally[0]),
            executedTimestampSeconds: proposalInfo.executed_timestamp_seconds,
            topic: proposalInfo.topic,
            status: proposalInfo.status,
            rewardStatus: proposalInfo.reward_status
        };
    }

    public toArrayOfNeuronInfo = (response: RawListNeuronsResponse, principal: Principal) : Array<NeuronInfo> => {
        const principalString = principal.toString();

        return response.neuron_infos.map(([id, neuronInfo]) =>
            this.toNeuronInfo(id, principalString, neuronInfo, response.full_neurons.find(neuron =>
                neuron.id.length > 0 && neuron.id[0].id === id
            )));
    }

    private toNeuronInfo(neuronId: bigint, principalString: string, neuronInfo: RawNeuronInfo, rawNeuron?: RawNeuron): NeuronInfo {
        const fullNeuron = rawNeuron ? this.toNeuron(rawNeuron, principalString) : null;
        return {
            neuronId: neuronId,
            dissolveDelaySeconds: neuronInfo.dissolve_delay_seconds,
            recentBallots: neuronInfo.recent_ballots.map(this.toBallotInfo),
            createdTimestampSeconds: neuronInfo.created_timestamp_seconds,
            state: neuronInfo.state,
            retrievedAtTimestampSeconds: neuronInfo.retrieved_at_timestamp_seconds,
            votingPower: neuronInfo.voting_power,
            ageSeconds: neuronInfo.age_seconds,
            fullNeuron: fullNeuron
        };
    }

    public toListProposalsResponse = (response: RawListProposalInfoResponse) : ListProposalsResponse => {
        return {
            proposals: response.proposal_info.map(this.toProposalInfo)
        };
    }

    public toSpawnResponse = (response: RawManageNeuronResponse) : SpawnResponse => {
        const command = (response.command)[0];
        if ("Spawn" in command) {
            return {
                createdNeuronId: (command.Spawn.created_neuron_id)[0].id
            };    
        }
        this.throwUnrecognisedTypeError("response", response);
    } 

    public toDisburseResponse = (response: RawManageNeuronResponse) : DisburseResponse => {
        const command = (response.command)[0];
        if ("Disburse" in command) {
            return {
                transferBlockHeight: command.Disburse.transfer_block_height
            };    
        }
        this.throwUnrecognisedTypeError("response", response);
    } 

    public toDisburseToNeuronResult = (response: RawManageNeuronResponse) : DisburseToNeuronResponse => {
        const command = (response.command)[0];
        if ("Spawn" in command) {
            return {
                createdNeuronId: (command.Spawn.created_neuron_id)[0].id
            };    
        }
        this.throwUnrecognisedTypeError("response", response);
    } 

    public toMakeProposalResponse = (response: RawManageNeuronResponse) : MakeProposalResponse => {
        const command = (response.command)[0];
        if ("MakeProposal" in command) {
            return {
                proposalId: (command.MakeProposal.proposal_id)[0].id
            };    
        }
        this.throwUnrecognisedTypeError("response", response);
    } 

    private toNeuron = (neuron: RawNeuron, principalString: string) : Neuron => {
        return {
            id: this.toNeuronId(neuron.id[0]),
            isCurrentUserController: neuron.controller[0].toString() === principalString,
            controller: neuron.controller[0].toString(),
            recentBallots: neuron.recent_ballots.map(this.toBallotInfo),
            kycVerified: neuron.kyc_verified,
            notForProfit: neuron.not_for_profit,
            cachedNeuronStake: neuron.cached_neuron_stake_e8s,
            createdTimestampSeconds: neuron.created_timestamp_seconds,
            maturityE8sEquivalent: neuron.maturity_e8s_equivalent,
            agingSinceTimestampSeconds: neuron.aging_since_timestamp_seconds,
            neuronFees: neuron.neuron_fees_e8s,
            hotKeys: neuron.hot_keys.map(p => p.toString()),
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
                DissolveDelaySeconds: dissolveState.DissolveDelaySeconds
            }
        } else {
            return {
                WhenDissolvedTimestampSeconds: dissolveState.WhenDissolvedTimestampSeconds
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
        if (!neuronStakeTransfer) {
            // This can be null for a genesis neuron
            return null;
        }

        return {
            toSubaccount: arrayOfNumberToArrayBuffer(neuronStakeTransfer.to_subaccount),
            from: neuronStakeTransfer.from ? neuronStakeTransfer.from[0].toString() : null,
            memo: neuronStakeTransfer.memo,
            neuronStake: neuronStakeTransfer.neuron_stake_e8s,
            fromSubaccount: arrayOfNumberToArrayBuffer(neuronStakeTransfer.from_subaccount),
            transferTimestamp: neuronStakeTransfer.transfer_timestamp,
            blockHeight: neuronStakeTransfer.block_height
        };        
    }

    private toNeuronId = (neuronId: RawNeuronId) : NeuronId => {
        return neuronId.id;
    }

    private toBallot = (neuronId: bigint, ballot: RawBallot) : Ballot => {
        return {
            neuronId: neuronId,
            vote: ballot.vote,
            votingPower: ballot.voting_power
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
        if ("ExecuteNnsFunction" in action) {
            const executeNnsFunction = action.ExecuteNnsFunction;
            return {
                ExecuteNnsFunction: {
                    nnsFunction: executeNnsFunction.nns_function,
                    payload: arrayOfNumberToArrayBuffer(executeNnsFunction.payload)
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
        if ("ApproveGenesisKyc" in action) {
            const approveKyc = action.ApproveGenesisKyc;
            return {
                ApproveGenesisKyc: {
                    principals: approveKyc.principals.map(p => p.toString())
                }
            }
        }
        if ("ManageNetworkEconomics" in action) {
            const networkEconomics = action.ManageNetworkEconomics;
            return {
                ManageNetworkEconomics: {
                    neuronMinimumStake: networkEconomics.neuron_minimum_stake_e8s,
                    maxProposalsToKeepPerTopic: networkEconomics.max_proposals_to_keep_per_topic,
                    neuronManagementFeePerProposal: networkEconomics.neuron_management_fee_per_proposal_e8s,
                    rejectCost: networkEconomics.reject_cost_e8s,
                    transactionFee: networkEconomics.transaction_fee_e8s,
                    neuronSpawnDissolveDelaySeconds: networkEconomics.neuron_spawn_dissolve_delay_seconds,
                    minimumIcpXdrRate: networkEconomics.minimum_icp_xdr_rate                ,
                    maximumNodeProviderRewards: networkEconomics.maximum_node_provider_rewards_e8s,
                }
            }
        }
        if ("RewardNodeProvider" in action) {
            const rewardNodeProvider = action.RewardNodeProvider;
            return {
                RewardNodeProvider: {
                    nodeProvider : rewardNodeProvider.node_provider.length ? this.toNodeProvider(rewardNodeProvider.node_provider[0]) : null,
                    amountE8s : rewardNodeProvider.amount_e8s,
                    rewardMode: rewardNodeProvider.reward_mode.length
                        ? this.toRewardMode(rewardNodeProvider.reward_mode[0])
                        : null
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
        if ("SetDefaultFollowees" in action) {
            const setDefaultFollowees = action.SetDefaultFollowees;
            return {
                SetDefaultFollowees: {
                    defaultFollowees: setDefaultFollowees.default_followees.map(([n, f]) => this.toFollowees(n, f))
                }
            };
        }
        this.throwUnrecognisedTypeError("action", action);
    }

    private toTally = (tally: RawTally) : Tally => {
        return {
            no: tally.no,
            yes: tally.yes,
            total: tally.total,
            timestampSeconds: tally.timestamp_seconds
        }
    }

    private toCommand = (command: RawCommand) : Command => {
        if ("Spawn" in command) {
            const spawn = command.Spawn;
            return {
                Spawn: {
                    newController: spawn.new_controller.length ? spawn.new_controller[0].toString() : null
                }
            }
        }
        if ("Split" in command) {
            const split = command.Split;
            return {
                Split: {
                    amount: split.amount_e8s
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
                    dissolveDelaySeconds: disburseToNeuron.dissolve_delay_seconds,
                    kycVerified: disburseToNeuron.kyc_verified,
                    amount: disburseToNeuron.amount_e8s,
                    newController: disburseToNeuron.new_controller.length ? disburseToNeuron.new_controller[0].toString() : null,
                    nonce: disburseToNeuron.nonce
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
                    toAccountId: this.toAccountIdentifier(disburse.to_account[0]),
                    amount: disburse.amount.length ? this.toAmount(disburse.amount[0]) : null
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
                    hotKeyToRemove: removeHotKey.hot_key_to_remove.length ? removeHotKey.hot_key_to_remove[0].toString() : null
                }
            }
        }
        if ("AddHotKey" in operation) {
            const addHotKey = operation.AddHotKey;
            return {
                AddHotKey: {
                    newHotKey: addHotKey.new_hot_key.length ? addHotKey.new_hot_key[0].toString() : null
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
            id: nodeProvider.id.length ? nodeProvider.id[0].toString() : null
        }
    }

    private toAmount = (amount: RawAmount) : E8s => {
        return amount.e8s;
    }

    private toAccountIdentifier(accountIdentifier: RawAccountIdentifier): AccountIdentifier {
        return accountIdentifierFromBytes(new Uint8Array(accountIdentifier.hash));
    }

    private toRewardMode(rewardMode: RawRewardMode) : RewardMode {
        if ("RewardToNeuron" in rewardMode) {
            return {
                RewardToNeuron: {
                    dissolveDelaySeconds: rewardMode.RewardToNeuron.dissolve_delay_seconds
                }
            };
        } else if ("RewardToAccount" in rewardMode) {
            return {
                RewardToAccount: {
                    toAccount: rewardMode.RewardToAccount.to_account != null && rewardMode.RewardToAccount.to_account.length
                        ? this.toAccountIdentifier(rewardMode.RewardToAccount.to_account[0])
                        : null
                }
            };
        } else {
            this.throwUnrecognisedTypeError("rewardMode", rewardMode);
        }
    }

    private throwUnrecognisedTypeError = (name: string, value: any) => {
        throw new Error(`Unrecognised ${name} type - ${JSON.stringify(value)}`);
    }
}
