import { Principal } from "@dfinity/agent";
import BigNumber from "bignumber.js";
import * as convert from "../converter";
import {
    Action,
    Amount,
    Ballot,
    Change,
    ClaimNeuronRequest,
    Command,
    ListProposalsRequest,
    ManageNeuron,
    NeuronId,
    NodeProvider,
    Operation,
    Proposal,
    ProposalId
} from "./model";
import {
    Action as RawAction,
    Amount as RawAmount,
    Ballot as RawBallot,
    Change as RawChange,
    Command as RawCommand,
    ListProposalInfo,
    ManageNeuron as RawManageNeuron,
    NeuronId as RawNeuronId,
    NodeProvider as RawNodeProvider,
    Operation as RawOperation,
    Proposal as RawProposal
} from "./rawService";

export default class RequestConverters {
    private readonly principal: Principal;
    constructor(principal: Principal) {
        this.principal = principal;
    }

    public fromManageNeuron = (manageNeuron: ManageNeuron) : RawManageNeuron => {
        return {
            id: manageNeuron.id ? [this.fromNeuronId(manageNeuron.id)] : [],
            command: manageNeuron.command ? [this.fromCommand(manageNeuron.command)] : []
        }
    }

    public fromClaimNeuronRequest = (request: ClaimNeuronRequest) : [Array<number>, BigNumber, BigNumber] => {
        return [
            convert.arrayBufferToArrayOfNumber(request.publicKey),
            convert.bigIntToBigNumber(request.nonce),
            convert.bigIntToBigNumber(request.dissolveDelayInSecs)
        ];
    }

    public fromListProposalsRequest = (request: ListProposalsRequest) : ListProposalInfo => {    
        return {
            include_reward_status: request.includeRewardStatus,
            before_proposal: request.beforeProposal ? [this.fromProposalId(request.beforeProposal)] : [],
            limit: request.limit,
            exclude_topic: request.excludeTopic,
            include_status: request.includeStatus
        };
    }

    private fromNeuronId = (neuronId: NeuronId) : RawNeuronId => {
        return {
            id: convert.bigIntToBigNumber(neuronId)
        };
    }

    private fromProposalId = (proposalId: ProposalId) : RawNeuronId => {
        return {
            id: convert.bigIntToBigNumber(proposalId)
        };
    }

    private fromBallot = (ballot: Ballot) : RawBallot => {
        return {
            vote: ballot.vote,
            voting_power: convert.bigIntToBigNumber(ballot.votingPower)
        };
    }

    private fromProposal = (proposal: Proposal) : RawProposal => {
        return {
            url: proposal.url,
            action: proposal.action ? [this.fromAction(proposal.action)] : [],
            summary: proposal.summary
        }
    }

    private fromAction = (action: Action) : RawAction => {
        if ("ExternalUpdate" in action) {
            const externalUpdate = action.ExternalUpdate;
            return {
                ExternalUpdate: {
                    update_type: externalUpdate.updateType,
                    payload: convert.arrayBufferToArrayOfNumber(externalUpdate.payload)
                }
            }
        }
        if ("ManageNeuron" in action) {
            const manageNeuron = action.ManageNeuron;
            return {
                ManageNeuron: {
                    id: manageNeuron.id ? [this.fromNeuronId(manageNeuron.id)] : [],
                    command: manageNeuron.command ? [this.fromCommand(manageNeuron.command[0])] : []
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
                    reject_cost_doms: convert.bigIntToBigNumber(networkEconomics.rejectCostDoms),
                    manage_neuron_cost_per_proposal_doms: convert.bigIntToBigNumber(networkEconomics.manageNeuronCostPerProposalDoms),
                    neuron_minimum_stake_doms: convert.bigIntToBigNumber(networkEconomics.neuronMinimumStakeDoms),
                    neuron_spawn_dissolve_delay_seconds: convert.bigIntToBigNumber(networkEconomics.neuronSpawnDissolveDelaySeconds),
                    maximum_node_provider_rewards_doms: convert.bigIntToBigNumber(networkEconomics.maximumNodeProviderRewardsDoms)
                }
            }
        }
        if ("RewardNodeProvider" in action) {
            const rewardNodeProvider = action.RewardNodeProvider;
            return {
                RewardNodeProvider: {
                    node_provider : rewardNodeProvider.nodeProvider ? [this.fromNodeProvider(rewardNodeProvider.nodeProvider)] : [],
                    amount_doms : convert.bigIntToBigNumber(rewardNodeProvider.amountDoms)
                }
            }
        }
        if ("AddOrRemoveNodeProvider" in action) {
            const addOrRemoveNodeProvider = action.AddOrRemoveNodeProvider;
            return {
                AddOrRemoveNodeProvider: {
                    change: addOrRemoveNodeProvider.change ? [this.fromChange(addOrRemoveNodeProvider.change)] : []
                }
            }
        }
        if ("Motion" in action) {
            const motion = action.Motion;
            return {
                Motion: {
                    motion_text: motion.motionText
                }
            }
        }
        this.throwUnrecognisedTypeError("action", action);
    }

    private fromCommand = (command: Command) : RawCommand => {
        if ("Split" in command) {
            const split = command.Split;
            return {
                Split: {
                    amount_doms: convert.bigIntToBigNumber(split.amountDoms)
                }
            }
        }
        if ("Follow" in command) {
            const follow = command.Follow;
            return {
                Follow: {
                    topic: follow.topic,
                    followees: follow.followees.map(this.fromNeuronId)
                }
            }
        }
        if ("Configure" in command) {
            const configure = command.Configure;
            return {
                Configure: {
                    operation: [this.fromOperation(configure.operation)]
                }
            }
        }
        if ("RegisterVote" in command) {
            const registerVote = command.RegisterVote;
            return {
                RegisterVote: {
                    vote: registerVote.vote,
                    proposal: [this.fromProposalId(registerVote.proposal)]
                }
            }
        }
        if ("DisburseToNeuron" in command) {
            const disburseToNeuron = command.DisburseToNeuron;
            return {
                DisburseToNeuron: {
                    dissolve_delay_seconds: convert.bigIntToBigNumber(disburseToNeuron.dissolveDelaySeconds),
                    kyc_verified: disburseToNeuron.kycVerified,
                    amount_doms: convert.bigIntToBigNumber(disburseToNeuron.amountDoms),
                    new_controller: disburseToNeuron.newController ? [disburseToNeuron.newController] : [],
                    nonce: convert.bigIntToBigNumber(disburseToNeuron.nonce)
                }
            }
        }
        if ("MakeProposal" in command) {
            const makeProposal = command.MakeProposal;
            return {
                MakeProposal: {
                    url: makeProposal.url,
                    action: makeProposal.action ? [this.fromAction(makeProposal.action)] : [],
                    summary: makeProposal.summary
                }
            }
        }
        if ("Disburse" in command) {
            const disburse = command.Disburse;
            return {
                Disburse: {
                    to_subaccount: disburse.toSubaccountId ? convert.fromSubAccountId(disburse.toSubaccountId) : [],
                    to_account: [this.principal],
                    amount: disburse.amount ? [this.fromAmount(disburse.amount)] : []
                }
            }
        }
        this.throwUnrecognisedTypeError("command", command);
    }

    private fromOperation = (operation: Operation) : RawOperation => {
        if ("RemoveHotKey" in operation) {
            const removeHotKey = operation.RemoveHotKey;
            return {
                RemoveHotKey: {
                    hot_key_to_remove: removeHotKey.hotKeyToRemove ? [removeHotKey.hotKeyToRemove] : []
                }
            }
        }
        if ("AddHotKey" in operation) {
            const addHotKey = operation.AddHotKey;
            return {
                AddHotKey: {
                    new_hot_key: addHotKey.newHotKey ? [addHotKey.newHotKey] : []
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
                    additional_dissolve_delay_seconds: increaseDissolveDelay.additionalDissolveDelaySeconds
                }
            }
        }
        this.throwUnrecognisedTypeError("operation", operation);
    }

    private fromChange = (change: Change) : RawChange => {
        if ("ToRemove" in change) {
            return {
                ToRemove: this.fromNodeProvider(change.ToRemove)
            }
        }
        if ("ToAdd" in change) {
            return {
                ToAdd: this.fromNodeProvider(change.ToAdd)
            }
        }
        this.throwUnrecognisedTypeError("change", change);
    }

    private fromNodeProvider = (nodeProvider: NodeProvider) : RawNodeProvider => {
        return {
            id: nodeProvider.id ? [nodeProvider.id] : []
        }
    }

    private fromAmount = (amount: Amount) : RawAmount => {
        return {
            doms: convert.bigIntToBigNumber(amount.doms)
        }
    }

    private throwUnrecognisedTypeError = (name: string, value: any) => {
        throw new Error(`Unrecognised ${name} type - ${JSON.stringify(value)}`);
    }
}
