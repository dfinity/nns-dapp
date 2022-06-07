import { Principal } from "@dfinity/principal";
import {
  accountIdentifierToBytes,
  arrayBufferToArrayOfNumber,
} from "../converter";
import { AccountIdentifier, E8s, NeuronId } from "../common/types";
import {
  Action,
  AddHotKeyRequest,
  By,
  Change,
  ClaimNeuronRequest,
  ClaimOrRefreshNeuronRequest,
  Command,
  DisburseRequest,
  DisburseToNeuronRequest,
  FollowRequest,
  IncreaseDissolveDelayRequest,
  ListProposalsRequest,
  MakeProposalRequest,
  ManageNeuron,
  MergeMaturityRequest,
  MergeRequest,
  NeuronIdOrSubaccount,
  NodeProvider,
  Operation,
  ProposalId,
  RegisterVoteRequest,
  RemoveHotKeyRequest,
  RewardMode,
  SpawnRequest,
  SplitRequest,
  StartDissolvingRequest,
  StopDissolvingRequest,
} from "./model";
import { AccountIdentifier as PbAccountIdentifier } from "../../proto/ledger_pb";
import {
  AccountIdentifier as RawAccountIdentifier,
  Action as RawAction,
  Amount,
  By as RawBy,
  Change as RawChange,
  Command as RawCommand,
  Followees as RawFollowees,
  ListProposalInfo,
  ManageNeuron as RawManageNeuron,
  NeuronId as RawNeuronId,
  NeuronIdOrSubaccount as RawNeuronIdOrSubaccount,
  NodeProvider as RawNodeProvider,
  Operation as RawOperation,
  RewardMode as RawRewardMode,
} from "./rawService";
import { ManageNeuron as PbManageNeuron } from "../../proto/governance_pb";
import {
  NeuronId as PbNeuronId,
  PrincipalId as PbPrincipalId,
  ProposalId as PbProposalId,
} from "../../proto/base_types_pb";
import { UnsupportedValueError } from "../../utils";
export default class RequestConverters {
  private readonly principal: Principal;
  constructor(principal: Principal) {
    this.principal = principal;
  }

  public fromManageNeuron = (manageNeuron: ManageNeuron): RawManageNeuron => {
    return {
      id: manageNeuron.id ? [this.fromNeuronId(manageNeuron.id)] : [],
      command: manageNeuron.command
        ? [this.fromCommand(manageNeuron.command)]
        : [],
      neuron_id_or_subaccount: manageNeuron.neuronIdOrSubaccount
        ? [this.fromNeuronIdOrSubaccount(manageNeuron.neuronIdOrSubaccount)]
        : [],
    };
  };

  public fromClaimNeuronRequest = (
    request: ClaimNeuronRequest
  ): [Array<number>, bigint, bigint] => {
    return [
      arrayBufferToArrayOfNumber(request.publicKey),
      request.nonce,
      request.dissolveDelayInSecs,
    ];
  };

  public fromListProposalsRequest = (
    request: ListProposalsRequest
  ): ListProposalInfo => {
    return {
      include_reward_status: request.includeRewardStatus,
      before_proposal: request.beforeProposal
        ? [this.fromProposalId(request.beforeProposal)]
        : [],
      limit: request.limit,
      exclude_topic: request.excludeTopic,
      include_status: request.includeStatus,
    };
  };

  public fromAddHotKeyRequest = (request: AddHotKeyRequest): PbManageNeuron => {
    const hotkeyPrincipal = new PbPrincipalId();
    hotkeyPrincipal.setSerializedId(
      Principal.fromText(request.principal).toUint8Array()
    );

    const hotkey = new PbManageNeuron.AddHotKey();
    hotkey.setNewHotKey(hotkeyPrincipal);

    const configure = new PbManageNeuron.Configure();
    configure.setAddHotKey(hotkey);

    const result = new PbManageNeuron();
    result.setConfigure(configure);
    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    result.setNeuronId(neuronId);

    return result;
  };

  public fromClaimOrRefreshNeuronRequest = (
    request: ClaimOrRefreshNeuronRequest
  ): RawManageNeuron => {
    const rawCommand: RawCommand = {
      ClaimOrRefresh: { by: [{ NeuronIdOrSubaccount: {} }] },
    };
    return {
      id: [],
      command: [rawCommand],
      neuron_id_or_subaccount: [{ NeuronId: { id: request.neuronId } }],
    };
  };

  public fromMergeMaturityRequest = (
    request: MergeMaturityRequest
  ): PbManageNeuron => {
    const mergeMaturity = new PbManageNeuron.MergeMaturity();
    mergeMaturity.setPercentageToMerge(request.percentageToMerge);
    const manageNeuron = new PbManageNeuron();
    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    manageNeuron.setNeuronId(neuronId);
    manageNeuron.setMergeMaturity(mergeMaturity);
    return manageNeuron;
  };

  public fromMergeRequest = (request: MergeRequest): PbManageNeuron => {
    const merge = new PbManageNeuron.Merge();
    const sourceNeuronId = new PbNeuronId();
    sourceNeuronId.setId(request.sourceNeuronId.toString());
    merge.setSourceNeuronId(sourceNeuronId);
    const manageNeuron = new PbManageNeuron();
    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    manageNeuron.setNeuronId(neuronId);
    manageNeuron.setMerge(merge);
    return manageNeuron;
  };

  public fromRemoveHotKeyRequest = (
    request: RemoveHotKeyRequest
  ): PbManageNeuron => {
    const hotkeyPrincipal = new PbPrincipalId();
    hotkeyPrincipal.setSerializedId(
      Principal.fromText(request.principal).toUint8Array()
    );

    const command = new PbManageNeuron.RemoveHotKey();
    command.setHotKeyToRemove(hotkeyPrincipal);

    const configure = new PbManageNeuron.Configure();
    configure.setRemoveHotKey(command);

    const result = new PbManageNeuron();
    result.setConfigure(configure);

    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    result.setNeuronId(neuronId);

    return result;
  };

  public fromStartDissolvingRequest = (
    request: StartDissolvingRequest
  ): PbManageNeuron => {
    const configure = new PbManageNeuron.Configure();
    configure.setStartDissolving(new PbManageNeuron.StartDissolving());

    const result = new PbManageNeuron();
    result.setConfigure(configure);

    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    result.setNeuronId(neuronId);

    return result;
  };

  public fromStopDissolvingRequest = (
    request: StopDissolvingRequest
  ): PbManageNeuron => {
    const configure = new PbManageNeuron.Configure();
    configure.setStopDissolving(new PbManageNeuron.StopDissolving());

    const result = new PbManageNeuron();
    result.setConfigure(configure);

    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    result.setNeuronId(neuronId);

    return result;
  };

  public fromIncreaseDissolveDelayRequest = (
    request: IncreaseDissolveDelayRequest
  ): PbManageNeuron => {
    const command = new PbManageNeuron.IncreaseDissolveDelay();
    command.setAdditionalDissolveDelaySeconds(
      request.additionalDissolveDelaySeconds
    );

    const configure = new PbManageNeuron.Configure();
    configure.setIncreaseDissolveDelay(command);

    const result = new PbManageNeuron();
    result.setConfigure(configure);

    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    result.setNeuronId(neuronId);

    return result;
  };

  public fromFollowRequest = (request: FollowRequest): PbManageNeuron => {
    const follow = new PbManageNeuron.Follow();
    follow.setTopic(request.topic);
    follow.setFolloweesList(
      request.followees.map((followee) => {
        const neuronId = new PbNeuronId();
        neuronId.setId(followee.toString());
        return neuronId;
      })
    );
    const manageNeuron = new PbManageNeuron();
    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    manageNeuron.setNeuronId(neuronId);
    manageNeuron.setFollow(follow);
    return manageNeuron;
  };

  public fromRegisterVoteRequest = (
    request: RegisterVoteRequest
  ): PbManageNeuron => {
    const registerVote = new PbManageNeuron.RegisterVote();
    registerVote.setVote(request.vote);
    const proposal = new PbProposalId();
    proposal.setId(request.proposal.toString());
    registerVote.setProposal(proposal);
    const manageNeuron = new PbManageNeuron();
    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    manageNeuron.setNeuronId(neuronId);
    manageNeuron.setRegisterVote(registerVote);
    return manageNeuron;
  };

  public fromSpawnRequest = (request: SpawnRequest): PbManageNeuron => {
    const spawn = new PbManageNeuron.Spawn();

    if (request.newController) {
      const newController = new PbPrincipalId();
      newController.setSerializedId(
        Principal.fromText(request.newController).toUint8Array().slice(4)
      );
      spawn.setNewController(newController);
    }

    if (request.percentageToSpawn != null) {
      spawn.setPercentageToSpawn(request.percentageToSpawn);
    }

    const manageNeuron = new PbManageNeuron();
    manageNeuron.setSpawn(spawn);

    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    manageNeuron.setNeuronId(neuronId);
    return manageNeuron;
  };

  public fromSplitRequest = (request: SplitRequest): RawManageNeuron => {
    const rawCommand: RawCommand = {
      Split: {
        amount_e8s: request.amount,
      },
    };
    return {
      id: [],
      command: [rawCommand],
      neuron_id_or_subaccount: [{ NeuronId: { id: request.neuronId } }],
    };
  };

  public fromDisburseRequest = (request: DisburseRequest): PbManageNeuron => {
    const disburse = new PbManageNeuron.Disburse();

    if (request.toAccountId) {
      const toAccountIdentifier = new PbAccountIdentifier();
      toAccountIdentifier.setHash(
        Uint8Array.from(Buffer.from(request.toAccountId, "hex"))
      );
      disburse.setToAccount(toAccountIdentifier);
    }

    if (request.amount != null) {
      const amount = new PbManageNeuron.Disburse.Amount();
      amount.setE8s(request.amount.toString());
      disburse.setAmount(amount);
    }

    const manageNeuron = new PbManageNeuron();
    manageNeuron.setDisburse(disburse);

    const neuronId = new PbNeuronId();
    neuronId.setId(request.neuronId.toString());
    manageNeuron.setNeuronId(neuronId);
    return manageNeuron;
  };

  public fromDisburseToNeuronRequest = (
    request: DisburseToNeuronRequest
  ): RawManageNeuron => {
    const rawCommand: RawCommand = {
      DisburseToNeuron: {
        dissolve_delay_seconds: request.dissolveDelaySeconds,
        kyc_verified: request.kycVerified,
        amount_e8s: request.amount,
        new_controller:
          request.newController != null
            ? [Principal.fromText(request.newController)]
            : [],
        nonce: request.nonce,
      },
    };
    return {
      id: [],
      command: [rawCommand],
      neuron_id_or_subaccount: [{ NeuronId: { id: request.neuronId } }],
    };
  };

  public fromMakeProposalRequest = (
    request: MakeProposalRequest
  ): RawManageNeuron => {
    const rawCommand: RawCommand = {
      MakeProposal: {
        url: request.url,
        title: request.title != null ? [request.title] : [],
        summary: request.summary,
        action: [this.fromAction(request.action)],
      },
    };
    return {
      id: [],
      command: [rawCommand],
      neuron_id_or_subaccount: [{ NeuronId: { id: request.neuronId } }],
    };
  };

  private fromFollowees(followees: Array<NeuronId>): RawFollowees {
    return {
      followees: followees.map(this.fromNeuronId),
    };
  }

  private fromNeuronId = (neuronId: NeuronId): RawNeuronId => {
    return {
      id: neuronId,
    };
  };

  private fromNeuronIdOrSubaccount = (
    neuronIdOrSubaccount: NeuronIdOrSubaccount
  ): RawNeuronIdOrSubaccount => {
    if ("NeuronId" in neuronIdOrSubaccount) {
      return { NeuronId: { id: neuronIdOrSubaccount.NeuronId } };
    }
    if ("Subaccount" in neuronIdOrSubaccount) {
      return { Subaccount: neuronIdOrSubaccount.Subaccount };
    }
    throw new UnsupportedValueError(neuronIdOrSubaccount);
  };

  private fromProposalId = (proposalId: ProposalId): RawNeuronId => {
    return {
      id: proposalId,
    };
  };

  private fromAction = (action: Action): RawAction => {
    if ("ExecuteNnsFunction" in action) {
      const executeNnsFunction = action.ExecuteNnsFunction;
      return {
        ExecuteNnsFunction: {
          nns_function: executeNnsFunction.nnsFunctionId,
          payload: arrayBufferToArrayOfNumber(executeNnsFunction.payloadBytes),
        },
      };
    }
    if ("ManageNeuron" in action) {
      const manageNeuron = action.ManageNeuron;
      return {
        ManageNeuron: this.fromManageNeuron(manageNeuron),
      };
    }
    if ("ApproveGenesisKyc" in action) {
      const approveGenesisKyc = action.ApproveGenesisKyc;
      return {
        ApproveGenesisKyc: {
          principals: approveGenesisKyc.principals.map(Principal.fromText),
        },
      };
    }
    if ("ManageNetworkEconomics" in action) {
      const networkEconomics = action.ManageNetworkEconomics;
      return {
        ManageNetworkEconomics: {
          neuron_minimum_stake_e8s: networkEconomics.neuronMinimumStake,
          max_proposals_to_keep_per_topic:
            networkEconomics.maxProposalsToKeepPerTopic,
          neuron_management_fee_per_proposal_e8s:
            networkEconomics.neuronManagementFeePerProposal,
          reject_cost_e8s: networkEconomics.rejectCost,
          transaction_fee_e8s: networkEconomics.transactionFee,
          neuron_spawn_dissolve_delay_seconds:
            networkEconomics.neuronSpawnDissolveDelaySeconds,
          minimum_icp_xdr_rate: networkEconomics.minimumIcpXdrRate,
          maximum_node_provider_rewards_e8s:
            networkEconomics.maximumNodeProviderRewards,
        },
      };
    }
    if ("RewardNodeProvider" in action) {
      const rewardNodeProvider = action.RewardNodeProvider;
      return {
        RewardNodeProvider: {
          node_provider: rewardNodeProvider.nodeProvider
            ? [this.fromNodeProvider(rewardNodeProvider.nodeProvider)]
            : [],
          amount_e8s: rewardNodeProvider.amountE8s,
          reward_mode:
            rewardNodeProvider.rewardMode != null
              ? [this.fromRewardMode(rewardNodeProvider.rewardMode)]
              : [],
        },
      };
    }
    if ("RewardNodeProviders" in action) {
      const rewardNodeProviders = action.RewardNodeProviders;
      return {
        RewardNodeProviders: {
          use_registry_derived_rewards: rewardNodeProviders.useRegistryDerivedRewards != null
            ? [rewardNodeProviders.useRegistryDerivedRewards]
            : [],
          rewards: rewardNodeProviders.rewards.map((r) => ({
            node_provider: r.nodeProvider
              ? [this.fromNodeProvider(r.nodeProvider)]
              : [],
            amount_e8s: r.amountE8s,
            reward_mode:
              r.rewardMode != null ? [this.fromRewardMode(r.rewardMode)] : [],
          })),
        },
      };
    }
    if ("AddOrRemoveNodeProvider" in action) {
      const addOrRemoveNodeProvider = action.AddOrRemoveNodeProvider;
      return {
        AddOrRemoveNodeProvider: {
          change: addOrRemoveNodeProvider.change
            ? [this.fromChange(addOrRemoveNodeProvider.change)]
            : [],
        },
      };
    }
    if ("Motion" in action) {
      const motion = action.Motion;
      return {
        Motion: {
          motion_text: motion.motionText,
        },
      };
    }

    if ("SetDefaultFollowees" in action) {
      const setDefaultFollowees = action.SetDefaultFollowees;
      return {
        SetDefaultFollowees: {
          default_followees: setDefaultFollowees.defaultFollowees.map((f) => [
            f.topic as number,
            this.fromFollowees(f.followees),
          ]),
        },
      };
    }

    if ("RegisterKnownNeuron" in action) {
      const knownNeuron = action.RegisterKnownNeuron;
      return {
        RegisterKnownNeuron: {
          id: [{ id: knownNeuron.id }],
          known_neuron_data: [
            {
              name: knownNeuron.name,
              description:
                knownNeuron.description !== null
                  ? [knownNeuron.description]
                  : [],
            },
          ],
        },
      };
    }

    // If there's a missing action, this line will cause a compiler error.
    throw new UnsupportedValueError(action);
  };

  private fromCommand = (command: Command): RawCommand => {
    if ("Split" in command) {
      const split = command.Split;
      return {
        Split: {
          amount_e8s: split.amount,
        },
      };
    }
    if ("Follow" in command) {
      const follow = command.Follow;
      return {
        Follow: {
          topic: follow.topic,
          followees: follow.followees.map(this.fromNeuronId),
        },
      };
    }
    if ("ClaimOrRefresh" in command) {
      const claimOrRefresh = command.ClaimOrRefresh;
      return {
        ClaimOrRefresh: {
          by: claimOrRefresh.by
            ? [this.fromClaimOrRefreshBy(claimOrRefresh.by)]
            : [],
        },
      };
    }
    if ("Configure" in command) {
      const configure = command.Configure;
      return {
        Configure: {
          operation: configure.operation
            ? [this.fromOperation(configure.operation)]
            : [],
        },
      };
    }
    if ("RegisterVote" in command) {
      const registerVote = command.RegisterVote;
      return {
        RegisterVote: {
          vote: registerVote.vote,
          proposal: registerVote.proposal
            ? [this.fromProposalId(registerVote.proposal)]
            : [],
        },
      };
    }
    if ("DisburseToNeuron" in command) {
      const disburseToNeuron = command.DisburseToNeuron;
      return {
        DisburseToNeuron: {
          dissolve_delay_seconds: disburseToNeuron.dissolveDelaySeconds,
          kyc_verified: disburseToNeuron.kycVerified,
          amount_e8s: disburseToNeuron.amount,
          new_controller: disburseToNeuron.newController
            ? [Principal.fromText(disburseToNeuron.newController)]
            : [],
          nonce: disburseToNeuron.nonce,
        },
      };
    }
    if ("MergeMaturity" in command) {
      const mergeMaturity = command.MergeMaturity;
      return {
        MergeMaturity: {
          percentage_to_merge: mergeMaturity.percentageToMerge,
        },
      };
    }
    if ("MakeProposal" in command) {
      const makeProposal = command.MakeProposal;
      return {
        MakeProposal: {
          url: makeProposal.url,
          title: [],
          action: makeProposal.action
            ? [this.fromAction(makeProposal.action)]
            : [],
          summary: makeProposal.summary,
        },
      };
    }
    if ("Disburse" in command) {
      const disburse = command.Disburse;
      return {
        Disburse: {
          to_account: disburse.toAccountId
            ? [this.fromAccountIdentifier(disburse.toAccountId)]
            : [],
          amount: disburse.amount ? [this.fromAmount(disburse.amount)] : [],
        },
      };
    }
    if ("Spawn" in command) {
      const spawn = command.Spawn;
      return {
        Spawn: {
          percentage_to_spawn:
            spawn.percentageToSpawn != null ? [spawn.percentageToSpawn] : [],
          new_controller: spawn.newController
            ? [Principal.fromText(spawn.newController)]
            : [],
          nonce: [],
        },
      };
    }
    if ("Merge" in command) {
      const merge = command.Merge;
      return {
        Merge: {
          source_neuron_id: merge.sourceNeuronId
            ? [{ id: merge.sourceNeuronId }]
            : [],
        },
      };
    }

    // If there's a missing command above, this line will cause a compiler error.
    throw new UnsupportedValueError(command);
  };

  private fromOperation = (operation: Operation): RawOperation => {
    if ("RemoveHotKey" in operation) {
      const removeHotKey = operation.RemoveHotKey;
      return {
        RemoveHotKey: {
          hot_key_to_remove:
            removeHotKey.hotKeyToRemove != null
              ? [Principal.fromText(removeHotKey.hotKeyToRemove)]
              : [],
        },
      };
    }
    if ("AddHotKey" in operation) {
      const addHotKey = operation.AddHotKey;
      return {
        AddHotKey: {
          new_hot_key: addHotKey.newHotKey
            ? [Principal.fromText(addHotKey.newHotKey)]
            : [],
        },
      };
    }
    if ("StopDissolving" in operation) {
      return {
        StopDissolving: {},
      };
    }
    if ("StartDissolving" in operation) {
      return {
        StartDissolving: {},
      };
    }
    if ("IncreaseDissolveDelay" in operation) {
      const increaseDissolveDelay = operation.IncreaseDissolveDelay;
      return {
        IncreaseDissolveDelay: {
          additional_dissolve_delay_seconds:
            increaseDissolveDelay.additionalDissolveDelaySeconds,
        },
      };
    }
    if ("JoinCommunityFund" in operation) {
      return operation;
    }
    if ("SetDissolveTimestamp" in operation) {
      const setDissolveTimestamp = operation.SetDissolveTimestamp;
      return {
        SetDissolveTimestamp: {
          dissolve_timestamp_seconds:
            setDissolveTimestamp.dissolveTimestampSeconds,
        },
      };
    }
    // If there's a missing operation above, this line will cause a compiler error.
    throw new UnsupportedValueError(operation);
  };

  private fromChange = (change: Change): RawChange => {
    if ("ToRemove" in change) {
      return {
        ToRemove: this.fromNodeProvider(change.ToRemove),
      };
    }
    if ("ToAdd" in change) {
      return {
        ToAdd: this.fromNodeProvider(change.ToAdd),
      };
    }
    // If there's a missing change above, this line will cause a compiler error.
    throw new UnsupportedValueError(change);
  };

  private fromNodeProvider = (nodeProvider: NodeProvider): RawNodeProvider => {
    return {
      id: nodeProvider.id != null ? [Principal.fromText(nodeProvider.id)] : [],
      reward_account:
        nodeProvider.rewardAccount != null
          ? [this.fromAccountIdentifier(nodeProvider.rewardAccount)]
          : [],
    };
  };

  private fromAmount(amount: E8s): Amount {
    return {
      e8s: amount,
    };
  }

  private fromAccountIdentifier(
    accountIdentifier: AccountIdentifier
  ): RawAccountIdentifier {
    const bytes = accountIdentifierToBytes(accountIdentifier);
    return {
      hash: arrayBufferToArrayOfNumber(bytes),
    };
  }

  private fromRewardMode(rewardMode: RewardMode): RawRewardMode {
    if ("RewardToNeuron" in rewardMode) {
      return {
        RewardToNeuron: {
          dissolve_delay_seconds:
            rewardMode.RewardToNeuron.dissolveDelaySeconds,
        },
      };
    } else if ("RewardToAccount" in rewardMode) {
      return {
        RewardToAccount: {
          to_account:
            rewardMode.RewardToAccount.toAccount != null
              ? [
                  this.fromAccountIdentifier(
                    rewardMode.RewardToAccount.toAccount
                  ),
                ]
              : [],
        },
      };
    } else {
      // If there's a missing rewardMode above, this line will cause a compiler error.
      throw new UnsupportedValueError(rewardMode);
    }
  }

  private fromClaimOrRefreshBy(by: By): RawBy {
    if ("NeuronIdOrSubaccount" in by) {
      return {
        NeuronIdOrSubaccount: {},
      };
    } else if ("Memo" in by) {
      return {
        Memo: by.Memo,
      };
    } else if ("MemoAndController" in by) {
      return {
        MemoAndController: {
          memo: by.MemoAndController.memo,
          controller: by.MemoAndController.controller
            ? [by.MemoAndController.controller]
            : [],
        },
      };
    } else {
      // Ensures all cases are covered at compile-time.
      throw new UnsupportedValueError(by);
    }
  }
}
