# How To Add/Change Proposal

There are parts that usually change in a proposal:

* A new `Action` variant.
* A new proposal topic.
* A new `nnsFunction`.

The change is not always just in one section. Many times you need to fix two sections simulataneously. For example, a new topic comes with a new `nnsFunction`.

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

### How To Update

- Upgrade candid file.
- Add the i18n label in `en.governance.json`.

## New Proposal Topic

The [topic](https://github.com/dfinity/ic-js/blob/main/packages/nns/candid/governance.did#L304) is a property of the `ProposalInfo` and it's of type integer.

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

### Backwards Compatiblity

A new topic does not break backwards compatibility. Therefore, there is no need to synchronize releases.

Yet, a proposal of that topic won't be rendered properly until the changes are made and release.

### How To Update

- Add to topic entre in the [governance enum](https://github.com/dfinity/ic-js/blob/main/packages/nns/src/enums/governance.enums.ts#L15).
- Add i18n labels in `en.governance.json`. "topics" and "topics_description".

## New `nnsFunction`

The `nnsFunction` is a property of the `Action` variant `ExecuteNnsFunction`. Find it [here](https://github.com/dfinity/ic-js/blob/main/packages/nns/candid/governance.did#L102).

```
type ExecuteNnsFunction = record { nns_function : int32; payload : vec nat8 };
```

### Backwards Compatiblity

A new `nnsFunction` does not break backwards compatibility. Therefore, there is no need to synchronize releases.

Yet, a proposal of with that `nnsFunction` won't be rendered properly until the changes are made and release.

### How To Update: Labels

- add `NnsFunction` id in `https://github.com/dfinity/ic-js/blob/main/packages/nns/src/enums/governance.enums.ts`
- update labels in `nns_functions` in `en.governance.json` (could be managed by dashboard team)
  - `nns_functions`
  - `nns_functions_description`

### How To Update Payload Definition

- In `Cargo.toml` update the rev using the latest `Bless Replica Version`
- In case of new payload type
  - If needed add the dependency (e.g. "ic-sns-swap") in the Cargo.toml (because the new proposal type is executed by
    new canister)
  - Add new payload type (e.g. `AddWasmRequest`) in `proposals.rs`
  - If the payload needs to be transformed for display (e.g. if it is too large), define the type into which the payload must be transformed, then implement `From<OriginalPayloadType` for this new type. (see `NNS function 3 - AddNNSCanister`) (use `Trimmed` suffix to define transformed version)
  - Update the `match nns_function` expression to include the new function (use either identity or transform depending on if the payload needs to be transformed).
- Build: `cargo build`
- Deploy and test on available proposals
