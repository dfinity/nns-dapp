import { Principal } from "@dfinity/principal";
import {
  accountIdentifierFromBytes,
  arrayOfNumberToArrayBuffer,
  arrayOfNumberToUint8Array,
  principalToAccountIdentifier,
} from "../converter";
import GOVERNANCE_CANISTER_ID from "./canisterId";
import { AccountIdentifier, E8s, NeuronId } from "../common/types";
import {
  Action,
  Ballot,
  BallotInfo,
  By,
  Change,
  Command,
  DisburseResponse,
  DisburseToNeuronResponse,
  DissolveState,
  EmptyResponse,
  Followees,
  KnownNeuron,
  ListProposalsResponse,
  MakeProposalResponse,
  MergeMaturityResponse,
  Neuron,
  NeuronIdOrSubaccount,
  NeuronInfo,
  NodeProvider,
  Operation,
  Proposal,
  ProposalInfo,
  RewardMode,
  SpawnResponse,
  Tally,
} from "./model";
import {
  AccountIdentifier as RawAccountIdentifier,
  Action as RawAction,
  Amount as RawAmount,
  Ballot as RawBallot,
  BallotInfo as RawBallotInfo,
  By as RawBy,
  Change as RawChange,
  Command as RawCommand,
  DissolveState as RawDissolveState,
  Followees as RawFollowees,
  KnownNeuron as RawKnownNeuron,
  ListNeuronsResponse as RawListNeuronsResponse,
  ListProposalInfoResponse as RawListProposalInfoResponse,
  ManageNeuronResponse as RawManageNeuronResponse,
  Neuron as RawNeuron,
  NeuronId as RawNeuronId,
  NeuronIdOrSubaccount as RawNeuronIdOrSubaccount,
  NeuronInfo as RawNeuronInfo,
  NodeProvider as RawNodeProvider,
  Operation as RawOperation,
  Proposal as RawProposal,
  ProposalInfo as RawProposalInfo,
  RewardMode as RawRewardMode,
  Tally as RawTally,
} from "./rawService";
import { UnsupportedValueError } from "../../utils";
import { Option } from "../option";
import { ManageNeuronResponse as PbManageNeuronResponse } from "../../proto/governance_pb";
import { getNnsFunctionName } from "./nnsFunctions/nnsFunctions";

export default class ResponseConverters {
  public toProposalInfo = (
    proposalInfo: RawProposalInfo,
    deserializePayloadAsJson: boolean
  ): ProposalInfo => {
    return {
      id: proposalInfo.id.length ? this.toNeuronId(proposalInfo.id[0]) : null,
      ballots: proposalInfo.ballots.map((b) => this.toBallot(b[0], b[1])),
      rejectCost: proposalInfo.reject_cost_e8s,
      proposalTimestampSeconds: proposalInfo.proposal_timestamp_seconds,
      rewardEventRound: proposalInfo.reward_event_round,
      failedTimestampSeconds: proposalInfo.failed_timestamp_seconds,
      decidedTimestampSeconds: proposalInfo.decided_timestamp_seconds,
      proposal: proposalInfo.proposal.length
        ? this.toProposal(proposalInfo.proposal[0], deserializePayloadAsJson)
        : null,
      proposer: proposalInfo.proposer.length
        ? this.toNeuronId(proposalInfo.proposer[0])
        : null,
      latestTally: proposalInfo.latest_tally.length
        ? this.toTally(proposalInfo.latest_tally[0])
        : null,
      executedTimestampSeconds: proposalInfo.executed_timestamp_seconds,
      topic: proposalInfo.topic,
      status: proposalInfo.status,
      rewardStatus: proposalInfo.reward_status,
    };
  };

  public toArrayOfNeuronInfo = (
    response: RawListNeuronsResponse,
    principal: Principal
  ): Array<NeuronInfo> => {
    const principalString = principal.toString();

    return response.neuron_infos.map(([id, neuronInfo]) =>
      this.toNeuronInfo(
        id,
        principalString,
        neuronInfo,
        response.full_neurons.find(
          (neuron) => neuron.id.length && neuron.id[0].id === id
        )
      )
    );
  };

  private toNeuronInfo(
    neuronId: bigint,
    principalString: string,
    neuronInfo: RawNeuronInfo,
    rawNeuron?: RawNeuron
  ): NeuronInfo {
    const fullNeuron = rawNeuron
      ? this.toNeuron(rawNeuron, principalString)
      : null;
    return {
      neuronId: neuronId,
      dissolveDelaySeconds: neuronInfo.dissolve_delay_seconds,
      recentBallots: neuronInfo.recent_ballots.map(this.toBallotInfo),
      createdTimestampSeconds: neuronInfo.created_timestamp_seconds,
      state: neuronInfo.state,
      joinedCommunityFundTimestampSeconds: neuronInfo
        .joined_community_fund_timestamp_seconds.length
        ? neuronInfo.joined_community_fund_timestamp_seconds[0]
        : null,
      retrievedAtTimestampSeconds: neuronInfo.retrieved_at_timestamp_seconds,
      votingPower: neuronInfo.voting_power,
      ageSeconds: neuronInfo.age_seconds,
      fullNeuron: fullNeuron,
    };
  }

  public toListProposalsResponse = (
    response: RawListProposalInfoResponse
  ): ListProposalsResponse => {
    return {
      proposals: response.proposal_info.map((p) =>
        this.toProposalInfo(p, false)
      ),
    };
  };

  public toKnownNeuron = (response: RawKnownNeuron): KnownNeuron => {
    return {
      id: response.id[0]?.id ?? BigInt(0),
      name: response.known_neuron_data[0]?.name ?? "",
      description: response.known_neuron_data[0]?.description[0] ?? "",
    };
  };

  public toSpawnResponse = (
    response: PbManageNeuronResponse
  ): SpawnResponse => {
    const createdNeuronId = response.getSpawn()?.getCreatedNeuronId();

    if (!createdNeuronId) {
      throw this.throwUnrecognisedTypeError("response", response);
    }

    return {
      createdNeuronId: BigInt(createdNeuronId.getId()),
    };
  };

  public toSplitResponse = (response: RawManageNeuronResponse): NeuronId => {
    const command = response.command.length ? response.command[0] : null;

    if (command && "Split" in command) {
      const createdNeuronId = command.Split.created_neuron_id;
      if (createdNeuronId.length) {
        return createdNeuronId[0].id;
      }
    }
    throw this.throwUnrecognisedTypeError("response", response);
  };

  public toDisburseResponse = (
    response: PbManageNeuronResponse
  ): DisburseResponse => {
    const blockHeight = response.getDisburse()?.getTransferBlockHeight();

    if (!blockHeight) {
      throw this.throwUnrecognisedTypeError("response", response);
    }

    return {
      transferBlockHeight: BigInt(blockHeight),
    };
  };

  public toDisburseToNeuronResult = (
    response: RawManageNeuronResponse
  ): DisburseToNeuronResponse => {
    const command = response.command;
    if (
      command.length &&
      "Spawn" in command[0] &&
      command[0].Spawn.created_neuron_id.length
    ) {
      return {
        createdNeuronId: command[0].Spawn.created_neuron_id[0].id,
      };
    }
    throw this.throwUnrecognisedTypeError("response", response);
  };

  public toClaimOrRefreshNeuronResponse = (
    response: RawManageNeuronResponse
  ): Option<NeuronId> => {
    const command = response.command;
    if (command.length && "ClaimOrRefresh" in command[0]) {
      return command[0].ClaimOrRefresh.refreshed_neuron_id.length
        ? command[0].ClaimOrRefresh.refreshed_neuron_id[0].id
        : null;
    }
    throw this.throwUnrecognisedTypeError("response", response);
  };

  public toMergeMaturityResponse = (
    response: PbManageNeuronResponse
  ): MergeMaturityResponse => {
    const error = response.getError();
    if (error) {
      throw error.getErrorMessage();
    }

    const mergeMaturityResponse = response.getMergeMaturity();
    if (mergeMaturityResponse) {
      return {
        mergedMaturityE8s: BigInt(mergeMaturityResponse.getMergedMaturityE8s()),
        newStakeE8s: BigInt(mergeMaturityResponse.getNewStakeE8s()),
      };
    }

    throw this.throwUnrecognisedTypeError("response", response);
  };

  public toMakeProposalResponse = (
    response: RawManageNeuronResponse
  ): MakeProposalResponse => {
    const command = response.command;
    if (
      command.length &&
      "MakeProposal" in command[0] &&
      command[0].MakeProposal.proposal_id.length
    ) {
      return {
        proposalId: command[0].MakeProposal.proposal_id[0].id,
      };
    }
    throw this.throwUnrecognisedTypeError("response", response);
  };

  public toEmptyManageNeuronResponse = (
    response: PbManageNeuronResponse
  ): EmptyResponse => {
    const error = response.getError();
    if (error) {
      throw error.getErrorMessage();
    }
    return { Ok: null };
  };

  private toNeuron = (neuron: RawNeuron, principalString: string): Neuron => {
    return {
      id: neuron.id.length ? this.toNeuronId(neuron.id[0]) : null,
      isCurrentUserController: neuron.controller.length
        ? neuron.controller[0].toString() === principalString
        : null,
      controller: neuron.controller.length
        ? neuron.controller[0].toString()
        : null,
      recentBallots: neuron.recent_ballots.map(this.toBallotInfo),
      kycVerified: neuron.kyc_verified,
      notForProfit: neuron.not_for_profit,
      cachedNeuronStake: neuron.cached_neuron_stake_e8s,
      createdTimestampSeconds: neuron.created_timestamp_seconds,
      maturityE8sEquivalent: neuron.maturity_e8s_equivalent,
      agingSinceTimestampSeconds: neuron.aging_since_timestamp_seconds,
      neuronFees: neuron.neuron_fees_e8s,
      hotKeys: neuron.hot_keys.map((p) => p.toString()),
      accountIdentifier: principalToAccountIdentifier(
        GOVERNANCE_CANISTER_ID,
        arrayOfNumberToUint8Array(neuron.account)
      ),
      joinedCommunityFundTimestampSeconds: neuron
        .joined_community_fund_timestamp_seconds.length
        ? neuron.joined_community_fund_timestamp_seconds[0]
        : null,
      dissolveState: neuron.dissolve_state.length
        ? this.toDissolveState(neuron.dissolve_state[0])
        : null,
      followees: neuron.followees.map(([n, f]) => this.toFollowees(n, f)),
    };
  };

  private toBallotInfo = (ballotInfo: RawBallotInfo): BallotInfo => {
    return {
      vote: ballotInfo.vote,
      proposalId: ballotInfo.proposal_id.length
        ? this.toNeuronId(ballotInfo.proposal_id[0])
        : null,
    };
  };

  private toDissolveState = (
    dissolveState: RawDissolveState
  ): DissolveState => {
    if ("DissolveDelaySeconds" in dissolveState) {
      return {
        DissolveDelaySeconds: dissolveState.DissolveDelaySeconds,
      };
    } else {
      return {
        WhenDissolvedTimestampSeconds:
          dissolveState.WhenDissolvedTimestampSeconds,
      };
    }
  };

  private toFollowees = (topic: number, followees: RawFollowees): Followees => {
    return {
      topic: topic,
      followees: followees.followees.map(this.toNeuronId),
    };
  };

  private toNeuronId = (neuronId: RawNeuronId): NeuronId => {
    return neuronId.id;
  };

  private toNeuronIdOrSubaccount = (
    neuronIdOrSubaccount: RawNeuronIdOrSubaccount
  ): NeuronIdOrSubaccount => {
    if ("NeuronId" in neuronIdOrSubaccount) {
      return { NeuronId: neuronIdOrSubaccount.NeuronId.id };
    }
    if ("Subaccount" in neuronIdOrSubaccount) {
      return { Subaccount: neuronIdOrSubaccount.Subaccount };
    }
    throw new UnsupportedValueError(neuronIdOrSubaccount);
  };

  private toBallot = (neuronId: bigint, ballot: RawBallot): Ballot => {
    return {
      neuronId: neuronId,
      vote: ballot.vote,
      votingPower: ballot.voting_power,
    };
  };

  private toProposal = (
    proposal: RawProposal,
    includePayload: boolean
  ): Proposal => {
    return {
      title: proposal.title.length ? proposal.title[0] : null,
      url: proposal.url,
      action: proposal.action.length
        ? this.toAction(proposal.action[0], includePayload)
        : null,
      summary: proposal.summary,
    };
  };

  private toAction = (
    action: RawAction,
    deserializePayloadAsJson: boolean
  ): Action => {
    if ("ExecuteNnsFunction" in action) {
      const executeNnsFunction = action.ExecuteNnsFunction;
      const payloadBytes = arrayOfNumberToArrayBuffer(
        executeNnsFunction.payload
      );

      let payload: Record<string, unknown> = {};
      if (deserializePayloadAsJson) {
        try {
          const payloadString = new TextDecoder().decode(payloadBytes);
          payload = JSON.parse(payloadString);
        } catch (e) {
          console.log("Unable to parse payload: " + e);
          payload = { error: "Unable to parse payload" };
        }
      }

      return {
        ExecuteNnsFunction: {
          nnsFunctionId: executeNnsFunction.nns_function,
          nnsFunctionName: getNnsFunctionName(executeNnsFunction.nns_function),
          payload,
          payloadBytes,
        },
      };
    }
    if ("ManageNeuron" in action) {
      const manageNeuron = action.ManageNeuron;
      return {
        ManageNeuron: {
          id: manageNeuron.id.length
            ? this.toNeuronId(manageNeuron.id[0])
            : null,
          command: manageNeuron.command.length
            ? this.toCommand(manageNeuron.command[0])
            : null,
          neuronIdOrSubaccount: manageNeuron.neuron_id_or_subaccount.length
            ? this.toNeuronIdOrSubaccount(
                manageNeuron.neuron_id_or_subaccount[0]
              )
            : null,
        },
      };
    }
    if ("ApproveGenesisKyc" in action) {
      const approveKyc = action.ApproveGenesisKyc;
      return {
        ApproveGenesisKyc: {
          principals: approveKyc.principals.map((p) => p.toString()),
        },
      };
    }
    if ("ManageNetworkEconomics" in action) {
      const networkEconomics = action.ManageNetworkEconomics;
      return {
        ManageNetworkEconomics: {
          neuronMinimumStake: networkEconomics.neuron_minimum_stake_e8s,
          maxProposalsToKeepPerTopic:
            networkEconomics.max_proposals_to_keep_per_topic,
          neuronManagementFeePerProposal:
            networkEconomics.neuron_management_fee_per_proposal_e8s,
          rejectCost: networkEconomics.reject_cost_e8s,
          transactionFee: networkEconomics.transaction_fee_e8s,
          neuronSpawnDissolveDelaySeconds:
            networkEconomics.neuron_spawn_dissolve_delay_seconds,
          minimumIcpXdrRate: networkEconomics.minimum_icp_xdr_rate,
          maximumNodeProviderRewards:
            networkEconomics.maximum_node_provider_rewards_e8s,
        },
      };
    }
    if ("RewardNodeProvider" in action) {
      const rewardNodeProvider = action.RewardNodeProvider;
      return {
        RewardNodeProvider: {
          nodeProvider: rewardNodeProvider.node_provider.length
            ? this.toNodeProvider(rewardNodeProvider.node_provider[0])
            : null,
          amountE8s: rewardNodeProvider.amount_e8s,
          rewardMode: rewardNodeProvider.reward_mode.length
            ? this.toRewardMode(rewardNodeProvider.reward_mode[0])
            : null,
        },
      };
    }
    if ("RewardNodeProviders" in action) {
      const rewardNodeProviders = action.RewardNodeProviders;
      return {
        RewardNodeProviders: {
          useRegistryDerivedRewards: rewardNodeProviders.use_registry_derived_rewards[0] ?? null,
          rewards: rewardNodeProviders.rewards.map((r) => ({
            nodeProvider: r.node_provider.length
              ? this.toNodeProvider(r.node_provider[0])
              : null,
            amountE8s: r.amount_e8s,
            rewardMode: r.reward_mode.length
              ? this.toRewardMode(r.reward_mode[0])
              : null,
          })),
        },
      };
    }
    if ("AddOrRemoveNodeProvider" in action) {
      const addOrRemoveNodeProvider = action.AddOrRemoveNodeProvider;
      return {
        AddOrRemoveNodeProvider: {
          change: addOrRemoveNodeProvider.change.length
            ? this.toChange(addOrRemoveNodeProvider.change[0])
            : null,
        },
      };
    }
    if ("Motion" in action) {
      const motion = action.Motion;
      return {
        Motion: {
          motionText: motion.motion_text,
        },
      };
    }
    if ("SetDefaultFollowees" in action) {
      const setDefaultFollowees = action.SetDefaultFollowees;
      return {
        SetDefaultFollowees: {
          defaultFollowees: setDefaultFollowees.default_followees.map(
            ([n, f]) => this.toFollowees(n, f)
          ),
        },
      };
    }
    if ("RegisterKnownNeuron" in action) {
      const knownNeuron = action.RegisterKnownNeuron;
      return {
        RegisterKnownNeuron: this.toKnownNeuron(knownNeuron),
      };
    }

    throw new UnsupportedValueError(action);
  };

  private toTally = (tally: RawTally): Tally => {
    return {
      no: tally.no,
      yes: tally.yes,
      total: tally.total,
      timestampSeconds: tally.timestamp_seconds,
    };
  };

  private toCommand = (command: RawCommand): Command => {
    if ("Spawn" in command) {
      const spawn = command.Spawn;
      return {
        Spawn: {
          percentageToSpawn: spawn.percentage_to_spawn.length
            ? spawn.percentage_to_spawn[0]
            : null,
          newController: spawn.new_controller.length
            ? spawn.new_controller[0].toString()
            : null,
        },
      };
    }
    if ("Split" in command) {
      const split = command.Split;
      return {
        Split: {
          amount: split.amount_e8s,
        },
      };
    }
    if ("Follow" in command) {
      const follow = command.Follow;
      return {
        Follow: {
          topic: follow.topic,
          followees: follow.followees.map(this.toNeuronId),
        },
      };
    }
    if ("ClaimOrRefresh" in command) {
      const claimOrRefresh = command.ClaimOrRefresh;
      return {
        ClaimOrRefresh: {
          by: claimOrRefresh.by.length
            ? this.toClaimOrRefreshBy(claimOrRefresh.by[0])
            : null,
        },
      };
    }
    if ("Configure" in command) {
      const configure = command.Configure;
      return {
        Configure: {
          operation: configure.operation.length
            ? this.toOperation(configure.operation[0])
            : null,
        },
      };
    }
    if ("RegisterVote" in command) {
      const registerVote = command.RegisterVote;
      return {
        RegisterVote: {
          vote: registerVote.vote,
          proposal: registerVote.proposal.length
            ? this.toNeuronId(registerVote.proposal[0])
            : null,
        },
      };
    }
    if ("DisburseToNeuron" in command) {
      const disburseToNeuron = command.DisburseToNeuron;
      return {
        DisburseToNeuron: {
          dissolveDelaySeconds: disburseToNeuron.dissolve_delay_seconds,
          kycVerified: disburseToNeuron.kyc_verified,
          amount: disburseToNeuron.amount_e8s,
          newController: disburseToNeuron.new_controller.length
            ? disburseToNeuron.new_controller[0].toString()
            : null,
          nonce: disburseToNeuron.nonce,
        },
      };
    }
    if ("MergeMaturity" in command) {
      const mergeMaturity = command.MergeMaturity;
      return {
        MergeMaturity: {
          percentageToMerge: mergeMaturity.percentage_to_merge,
        },
      };
    }
    if ("MakeProposal" in command) {
      const makeProposal = command.MakeProposal;
      return {
        MakeProposal: {
          title: makeProposal.title.length ? makeProposal.title[0] : null,
          url: makeProposal.url,
          action: makeProposal.action.length
            ? this.toAction(makeProposal.action[0], false)
            : null,
          summary: makeProposal.summary,
        },
      };
    }
    if ("Disburse" in command) {
      const disburse = command.Disburse;
      return {
        Disburse: {
          toAccountId: disburse.to_account.length
            ? this.toAccountIdentifier(disburse.to_account[0])
            : null,
          amount: disburse.amount.length
            ? this.toAmount(disburse.amount[0])
            : null,
        },
      };
    }
    if ("Merge" in command) {
      const merge = command.Merge;
      return {
        Merge: {
          sourceNeuronId: merge.source_neuron_id.length
            ? merge.source_neuron_id[0].id
            : null,
        },
      };
    }
    throw new UnsupportedValueError(command);
  };

  private toOperation = (operation: RawOperation): Operation => {
    if ("RemoveHotKey" in operation) {
      const removeHotKey = operation.RemoveHotKey;
      return {
        RemoveHotKey: {
          hotKeyToRemove: removeHotKey.hot_key_to_remove.length
            ? removeHotKey.hot_key_to_remove[0].toString()
            : null,
        },
      };
    }
    if ("AddHotKey" in operation) {
      const addHotKey = operation.AddHotKey;
      return {
        AddHotKey: {
          newHotKey: addHotKey.new_hot_key.length
            ? addHotKey.new_hot_key[0].toString()
            : null,
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
          additionalDissolveDelaySeconds:
            increaseDissolveDelay.additional_dissolve_delay_seconds,
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
          dissolveTimestampSeconds:
            setDissolveTimestamp.dissolve_timestamp_seconds,
        },
      };
    }
    throw new UnsupportedValueError(operation);
  };

  private toChange = (change: RawChange): Change => {
    if ("ToRemove" in change) {
      return {
        ToRemove: this.toNodeProvider(change.ToRemove),
      };
    }
    if ("ToAdd" in change) {
      return {
        ToAdd: this.toNodeProvider(change.ToAdd),
      };
    }
    throw new UnsupportedValueError(change);
  };

  private toNodeProvider = (nodeProvider: RawNodeProvider): NodeProvider => {
    return {
      id: nodeProvider.id.length ? nodeProvider.id[0].toString() : null,
      rewardAccount: nodeProvider.reward_account.length
        ? this.toAccountIdentifier(nodeProvider.reward_account[0])
        : null,
    };
  };

  private toAmount = (amount: RawAmount): E8s => {
    return amount.e8s;
  };

  private toAccountIdentifier(
    accountIdentifier: RawAccountIdentifier
  ): AccountIdentifier {
    return accountIdentifierFromBytes(new Uint8Array(accountIdentifier.hash));
  }

  private toRewardMode(rewardMode: RawRewardMode): RewardMode {
    if ("RewardToNeuron" in rewardMode) {
      return {
        RewardToNeuron: {
          dissolveDelaySeconds:
            rewardMode.RewardToNeuron.dissolve_delay_seconds,
        },
      };
    } else if ("RewardToAccount" in rewardMode) {
      return {
        RewardToAccount: {
          toAccount:
            rewardMode.RewardToAccount.to_account != null &&
            rewardMode.RewardToAccount.to_account.length
              ? this.toAccountIdentifier(
                  rewardMode.RewardToAccount.to_account[0]
                )
              : null,
        },
      };
    } else {
      // Ensures all cases are covered at compile-time.
      throw new UnsupportedValueError(rewardMode);
    }
  }

  private toClaimOrRefreshBy(by: RawBy): By {
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
          controller: by.MemoAndController.controller.length
            ? by.MemoAndController.controller[0]
            : null,
        },
      };
    } else {
      // Ensures all cases are covered at compile-time.
      throw new UnsupportedValueError(by);
    }
  }

  // eslint-disable-next-line
  private throwUnrecognisedTypeError(name: string, value: any): Error {
    return new Error(`Unrecognised ${name} type - ${JSON.stringify(value)}`);
  }
}
