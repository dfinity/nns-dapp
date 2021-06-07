import { Principal } from "@dfinity/principal";
import { accountIdentifierToBytes, arrayBufferToArrayOfNumber } from "../converter";
import { AccountIdentifier, E8s, NeuronId } from "../common/types";
import {
    Action,
    AddHotKeyRequest,
    Change,
    ClaimNeuronRequest,
    Command,
    DisburseRequest,
    DisburseToNeuronRequest,
    FollowRequest,
    IncreaseDissolveDelayRequest,
    ListProposalsRequest,
    MakeMotionProposalRequest,
    MakeNetworkEconomicsProposalRequest,
    MakeRewardNodeProviderProposalRequest,
    MakeSetDefaultFolloweesProposalRequest,
    ManageNeuron,
    NodeProvider,
    Operation,
    ProposalId,
    RegisterVoteRequest,
    RemoveHotKeyRequest,
    SpawnRequest,
    SplitRequest,
    StartDissolvingRequest
} from "./model";
import {
    AccountIdentifier as RawAccountIdentifier,
    Action as RawAction,
    Amount,
    Change as RawChange,
    Command as RawCommand,
    Followees as RawFollowees,
    ListProposalInfo,
    ManageNeuron as RawManageNeuron,
    NeuronId as RawNeuronId,
    NodeProvider as RawNodeProvider,
    Operation as RawOperation
} from "./rawService";

export default class RequestConverters {
    private readonly principal: Principal;
    constructor(principal: Principal) {
        this.principal = principal;
    }

    public fromManageNeuron = (manageNeuron: ManageNeuron) : RawManageNeuron => {
        return {
            id: [this.fromNeuronId(manageNeuron.id)],
            command: [this.fromCommand(manageNeuron.command)]
        }
    }

    public fromClaimNeuronRequest = (request: ClaimNeuronRequest) : [Array<number>, bigint, bigint] => {
        return [
            arrayBufferToArrayOfNumber(request.publicKey),
            request.nonce,
            request.dissolveDelayInSecs
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

    public fromAddHotKeyRequest = (request: AddHotKeyRequest) : RawManageNeuron => {
        const rawOperation: RawOperation = { AddHotKey: { new_hot_key: [Principal.fromText(request.principal)] } };
        const rawCommand: RawCommand =  { Configure: { operation: [rawOperation] } };
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromRemoveHotKeyRequest = (request: RemoveHotKeyRequest) : RawManageNeuron => {
        const rawOperation: RawOperation = { RemoveHotKey: { hot_key_to_remove: [Principal.fromText(request.principal)] } };
        const rawCommand: RawCommand =  { Configure: { operation: [rawOperation] } };
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromStartDissolvingRequest = (request: StartDissolvingRequest) : RawManageNeuron => {
        const rawOperation: RawOperation = { StartDissolving: {} };
        const rawCommand: RawCommand =  { Configure: { operation: [rawOperation] } };
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromStopDissolvingRequest = (request: StartDissolvingRequest) : RawManageNeuron => {
        const rawOperation: RawOperation = { StopDissolving: {} };
        const rawCommand: RawCommand =  { Configure: { operation: [rawOperation] } };
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromIncreaseDissolveDelayRequest = (request: IncreaseDissolveDelayRequest) : RawManageNeuron => {
        const rawOperation: RawOperation = { IncreaseDissolveDelay: { 
            additional_dissolve_delay_seconds : request.additionalDissolveDelaySeconds 
        }};
        const rawCommand: RawCommand =  { Configure: { operation: [rawOperation] } };
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromFollowRequest = (request: FollowRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { Follow: { 
            topic : request.topic, 
            followees : request.followees.map(this.fromNeuronId) 
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromRegisterVoteRequest = (request: RegisterVoteRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { RegisterVote: { 
            vote : request.vote, 
            proposal : [this.fromProposalId(request.proposal)] }
        };
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromSpawnRequest = (request: SpawnRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { Spawn: { 
            new_controller: request.newController ? [Principal.fromText(request.newController)] : []
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }
    
    public fromSplitRequest = (request: SplitRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { Split: { 
            amount_e8s: request.amount
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromDisburseRequest = (request: DisburseRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { Disburse: { 
            to_account: [this.fromAccountIdentifier(request.toAccountId)],
            amount : request.amount ? [this.fromAmount(request.amount)] : []
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromDisburseToNeuronRequest = (request: DisburseToNeuronRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { DisburseToNeuron: { 
            dissolve_delay_seconds : request.dissolveDelaySeconds,
            kyc_verified : request.kycVerified,
            amount_e8s : request.amount,
            new_controller : [Principal.fromText(request.newController)],
            nonce : request.nonce
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromMakeMotionProposalRequest = (request: MakeMotionProposalRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { MakeProposal: { 
            url: request.url,
            summary: request.summary,
            action: [{ Motion: { motion_text: request.text } }]
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromMakeNetworkEconomicsProposalRequest = (request: MakeNetworkEconomicsProposalRequest) : RawManageNeuron => {
        const networkEconomics = request.networkEcomomics;
        const rawCommand: RawCommand =  { MakeProposal: { 
            url: request.url,
            summary: request.summary,
            action: [{ ManageNetworkEconomics: { 
                neuron_minimum_stake_e8s: networkEconomics.neuronMinimumStake,
                max_proposals_to_keep_per_topic : networkEconomics.maxProposalsToKeepPerTopic,
                neuron_management_fee_per_proposal_e8s :networkEconomics.neuronManagementFeePerProposal,
                reject_cost_e8s : networkEconomics.rejectCost,
                transaction_fee_e8s : networkEconomics.transactionFee,
                neuron_spawn_dissolve_delay_seconds : networkEconomics.neuronSpawnDissolveDelaySeconds,
                minimum_icp_xdr_rate : networkEconomics.minimumIcpXdrRate,
                maximum_node_provider_rewards_e8s : networkEconomics.maximumNodeProviderRewards,
            } }]
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromMakeRewardNodeProviderProposalRequest = (request: MakeRewardNodeProviderProposalRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { MakeProposal: { 
            url: request.url,
            summary: request.summary,
            action: [{ RewardNodeProvider: { 
                amount_e8s: request.amount,
                node_provider: [{
                    id: [Principal.fromText(request.nodeProvider)]
                }],
                create_neuron: request.createNeuron != null ? [{ dissolve_delay_seconds: request.createNeuron.dissolveDelaySeconds }] : []
            } }]
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    public fromMakeSetDefaultFolloweesProposalRequest = (request: MakeSetDefaultFolloweesProposalRequest) : RawManageNeuron => {
        const rawCommand: RawCommand =  { MakeProposal: { 
            url: request.url,
            summary: request.summary,
            action: [{ SetDefaultFollowees: { 
                default_followees: request.followees.map(f => [f.topic as number, this.fromFollowees(f.followees)])
            } }]
        }};
        return {
            id: [this.fromNeuronId(request.neuronId)],
            command: [rawCommand]
        };
    }

    private fromFollowees(followees: Array<NeuronId>): RawFollowees {
        return {
            followees: followees.map(this.fromNeuronId)
        };
    }

    private fromNeuronId = (neuronId: NeuronId) : RawNeuronId => {
        return {
            id: neuronId
        };
    }

    private fromProposalId = (proposalId: ProposalId) : RawNeuronId => {
        return {
            id: proposalId
        };
    }

    private fromAction = (action: Action) : RawAction => {
        if ("ExecuteNnsFunction" in action) {
            const executeNnsFunction = action.ExecuteNnsFunction;
            return {
                ExecuteNnsFunction: {
                    nns_function: executeNnsFunction.nnsFunction,
                    payload: arrayBufferToArrayOfNumber(executeNnsFunction.payload)
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
        if ("ApproveGenesisKyc" in action) {
            const approveGenesisKyc = action.ApproveGenesisKyc;
            return {
                ApproveGenesisKyc: {
                    principals: approveGenesisKyc.principals.map(Principal.fromText)
                }
            }
        }
        if ("ManageNetworkEconomics" in action) {
            const networkEconomics = action.ManageNetworkEconomics;
            return {
                ManageNetworkEconomics: {
                    neuron_minimum_stake_e8s: networkEconomics.neuronMinimumStake,
                    max_proposals_to_keep_per_topic : networkEconomics.maxProposalsToKeepPerTopic,
                    neuron_management_fee_per_proposal_e8s :networkEconomics.neuronManagementFeePerProposal,
                    reject_cost_e8s : networkEconomics.rejectCost,
                    transaction_fee_e8s : networkEconomics.transactionFee,
                    neuron_spawn_dissolve_delay_seconds : networkEconomics.neuronSpawnDissolveDelaySeconds,
                    minimum_icp_xdr_rate : networkEconomics.minimumIcpXdrRate,
                    maximum_node_provider_rewards_e8s : networkEconomics.maximumNodeProviderRewards,
                }
            }
        }
        if ("RewardNodeProvider" in action) {
            const rewardNodeProvider = action.RewardNodeProvider;
            return {
                RewardNodeProvider: {
                    node_provider : rewardNodeProvider.nodeProvider ? [this.fromNodeProvider(rewardNodeProvider.nodeProvider)] : [],
                    amount_e8s : rewardNodeProvider.amount,
                    create_neuron: rewardNodeProvider.createNeuron != null ? [{ dissolve_delay_seconds: rewardNodeProvider.createNeuron.dissolveDelaySeconds }] : []
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
                    amount_e8s: split.amount
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
                    dissolve_delay_seconds: disburseToNeuron.dissolveDelaySeconds,
                    kyc_verified: disburseToNeuron.kycVerified,
                    amount_e8s: disburseToNeuron.amount,
                    new_controller: disburseToNeuron.newController ? [Principal.fromText(disburseToNeuron.newController)] : [],
                    nonce: disburseToNeuron.nonce
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
                    to_account: [this.fromAccountIdentifier(disburse.toAccountId)],
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
                    hot_key_to_remove: removeHotKey.hotKeyToRemove ? [Principal.fromText(removeHotKey.hotKeyToRemove)] : []
                }
            }
        }
        if ("AddHotKey" in operation) {
            const addHotKey = operation.AddHotKey;
            return {
                AddHotKey: {
                    new_hot_key: addHotKey.newHotKey ? [Principal.fromText(addHotKey.newHotKey)] : []
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
            id: nodeProvider.id ? [Principal.fromText(nodeProvider.id)] : []
        }
    }

    private fromAmount(amount: E8s): Amount {
        return {
            e8s: amount
        };
    }

    private fromAccountIdentifier(accountIdentifier: AccountIdentifier): RawAccountIdentifier {
        const bytes = accountIdentifierToBytes(accountIdentifier);
        return {
            hash: arrayBufferToArrayOfNumber(bytes)
        };
    }
    
    private throwUnrecognisedTypeError = (name: string, value: any) => {
        throw new Error(`Unrecognised ${name} type - ${JSON.stringify(value)}`);
    }
}
