# How To Add/Change Proposal

There are parts that usually change in a proposal:

- A new `Action` variant.
- A new proposal topic.
- A new `nnsFunction` or changes in one.

The change is not always just in one section. Many times you need to fix two sections simultaneously. For example, a new topic comes with a new `nnsFunction`.

## New Action

The `Action` is a type in the [Governance candid interface](https://github.com/dfinity/ic-js/blob/main/packages/nns/candid/governance.did#L3) and it's used in the Proposal type:

```
type Action = variant {
  RegisterKnownNeuron : KnownNeuron;
  ManageNeuron : ManageNeuron;
  ExecuteNnsFunction : ExecuteNnsFunction;
  RewardNodeProvider : RewardNodeProvider;
  OpenSnsTokenSwap : OpenSnsTokenSwap;
  SetSnsTokenSwapOpenTimeWindow : SetSnsTokenSwapOpenTimeWindow;
  SetDefaultFollowees : SetDefaultFollowees;
  RewardNodeProviders : RewardNodeProviders;
  ManageNetworkEconomics : NetworkEconomics;
  ApproveGenesisKyc : ApproveGenesisKyc;
  AddOrRemoveNodeProvider : AddOrRemoveNodeProvider;
  Motion : Motion;
};

type Proposal = record {
  url : text;
  title : opt text;
  action : opt Action;
  summary : text;
};
```

### Backwards Compatibility

Adding a new `Action` variant breaks backwards compatibility.

This means that we need to upgrade the candid files and related, and synchronize the release with the Governance canister.

More information [here](https://dfinity.slack.com/archives/C039M7YS6F6/p1753696102949419?thread_ts=1752675655.965359&cid=C039M7YS6F6)

### How To Update

- Update [ic-js](https://github.com/dfinity/ic-js) to be aware of the new Action.
- Bump ic-js in the nns-dapp to contain the new Action.
- The proposal detail page takes the type name, the type description, and the payload of a proposal from the `selfDescribingAction` field that governance returns. No label and no payload code is needed in nns-dapp.

## New Proposal Topic

The [topic](https://github.com/dfinity/ic-js/blob/d94f2b3ae699de17653a174d4b38bf1b44fea2ea/packages/nns/candid/governance.did#L383) is a property of the `ProposalInfo` and it's of type integer.

```
type ProposalInfo = record {
  id : opt NeuronId;
  status : int32;
  topic : int32;
  failure_reason : opt GovernanceError;
  ballots : vec record { nat64; Ballot };
  proposal_timestamp_seconds : nat64;
  reward_event_round : nat64;
  deadline_timestamp_seconds : opt nat64;
  failed_timestamp_seconds : nat64;
  reject_cost_e8s : nat64;
  latest_tally : opt Tally;
  reward_status : int32;
  decided_timestamp_seconds : nat64;
  proposal : opt Proposal;
  proposer : opt NeuronId;
  executed_timestamp_seconds : nat64;
};
```

### Backwards Compatibility

A new topic does not break backwards compatibility. Therefore, there is no need to synchronize releases.

Yet, a proposal of that topic won't be rendered properly until the changes are made and release.

### How To Update

**Changes in ic-js:**

- Add to topic entry in the [governance enum](https://github.com/dfinity/ic-js/blob/main/packages/nns/src/enums/governance.enums.ts#L15).
- Add topic entry in the `Topic` for [protobuf files](https://github.com/dfinity/ic-js/tree/main/packages/nns/proto). You can search for `TOPIC_NEURON_MANAGEMENT` to better see where to add them.

**Changes in nns-dapp:**

- Add i18n labels in `en.governance.json`: `topics` and `topics_description`.
- Add i18n labels in `en.json`: `follow_neurons.topic_XX_title` and `follow_neurons.topic_XX_description`

The topic descriptions can be found in [`governance.proto`](https://github.com/dfinity/ic/blob/master/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto) in IC repo.

### Upgrade dependencies: Ledger ICP App

One dependency for the topics is the [Ledger](https://www.ledger.com/) App developed by [Zondax](https://github.com/Zondax).

When there is a new topic we need to open an issue in the [Ledger ICP repo](https://github.com/Zondax/ledger-icp).

We need to specify the number of the new topic and the title that should be shown in the screen. The title should be the same as the label in `en.governance.json` from the point above.

## New or changes in `nnsFunction`

A new `nnsFunction` does not break backwards compatibility. Therefore, there
is no need to synchronize releases.

Governance decodes the payload of an `ExecuteNnsFunction` proposal and returns
it in the `selfDescribingAction` field of the proposal, together with the type
name and the type description. The proposal detail page renders that value as
it is. nns-dapp needs no change for a new NNS function.

If the frontend needs to identify the new NNS function by name, add it to the
[`NnsFunction` enum](https://github.com/dfinity/ic-js/blame/main/packages/nns/src/enums/governance.enums.ts#:~:text=export%20enum%20NnsFunction%20%7B)
in `ic-js` and bump `ic-js` in nns-dapp.
