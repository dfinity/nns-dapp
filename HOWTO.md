# How To Add/Change Proposal

There are parts that usually change in a proposal:

- A new `Action` variant.
- A new proposal topic.
- A new `nnsFunction` or changes in one.

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
- Upgrade the IC dependencies in nns-dapp canister.

#### How To Upgrade IC Dependencies

The Internet Computer dependencies are in the [Cargo.toml](./rs/backend/Cargo.toml) of the backend project. They are the ones that point to `git = "https://github.com/dfinity/ic"`. For example:

```
ic-nns-governance = { git = "https://github.com/dfinity/ic", rev = "89129b8212791d7e05cab62ff08eece2888a86e0" }
```

Upgrading them means change the commit in `rev = ...`.

Normally, upgrading the dependency of `ic-nns-governance` is enough. But sometimes this library depends on the others and you need to upgrade the others.

**Which commit?**

Ideally, you should update to the upcoming commit that the NNS team is planning on releasing. You need to ask the NNS Team about their upcoming release.

Otherwise, you need to find the commit that added the new Action. Check the blame of the file in the IC repo or ask the NNS Team.


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

**Changes in nns-js:**

- Add to topic entry in the [governance enum](https://github.com/dfinity/ic-js/blob/main/packages/nns/src/enums/governance.enums.ts#L15).
- Add topic entry in the `Topic` for [proto files](https://github.com/dfinity/ic-js/tree/main/packages/nns/proto). You can search for `TOPIC_NEURON_MANAGEMENT` to better see where to add them.

**Changes in nns-dapp:**

- Add i18n labels in `en.governance.json`. "topics" and "topics_description".
- Add i18n labels in `en.json`: "follow_neurons.topic_XX_title" and "follow_neurons.topic_XX_description"

The topic descriptions can be found in [governance.proto](https://github.com/dfinity/ic/blob/master/rs/nns/governance/proto/ic_nns_governance/pb/v1/governance.proto) in IC repo.

### Upgrade dependencies: Ledger ICP App

One dependency for the topics is the [Ledger](https://www.ledger.com/) App developed by [Zondax](https://github.com/Zondax).

When there is a new topic we need to open an issue in the [Ledger ICP repo](https://github.com/Zondax/ledger-icp).

We need to specify the number of the new topic and the title that should be shown in the screen. The title should be the same as the label in `en.governance.json` from the point above.

## New or changes in `nnsFunction`

There are several steps to adding a new NNS function. They are described in
detail below but at a high level they are:

1. Verify that the intended change is for a new NNS function
2. Understand the impact of a new NNS function
3. Install a new governance canister
4. Create a proposal with a payload for the new NNS function
5. Verify that it doesn't render correctly yet
6. Make the code changes
7. Verify that it does render correctly

### 1. Verify that the intended change is for a new NNS function

All the NNS functions are defined
[here](https://github.com/dfinity/ic/blame/master/rs/nns/governance/src/gen/ic_nns_governance.pb.v1.rs#:~:text=pub%20enum%20NnsFunction%20%7B)
under `pub enum NnsFunction {`.
Check towards the bottom of the list of NNS functions to find the new type.
Note down its name and number. For example `BitcoinSetConfig = 39`.

**Note**: If the above link is broken because the file
has moved, [here](https://github.com/dfinity/ic/blob/509b1e62ba94014246c019fb26bba404f25adabd/rs/nns/governance/src/gen/ic_nns_governance.pb.v1.rs#L3102) is an old version to track down what happened.


### 2. Understand the impact

A new `nnsFunction` does not break backwards compatibility. Therefore, there
is no need to synchronize releases.

Yet, a proposal with that `nnsFunction` won't be rendered properly until the
changes are made and released.


### 3. Install a new governance canister

Here we explain how to do it on dfx network `local`. It's possible to do the
same on testnet but that's not described here.

First you need to determine from which commit you want to install the governance
canister. This can be the commit that added the new proposal type or the latest
commit which provides built artifacts. The latter you can get by running
`newest_sha_with_disk_image.sh` in the ic repo.

1. `git clone git@github.com:dfinity/ic.git`
2. `cd ic`
3. `git pull  # If you didn't clone it just now`
3. `IC_COMMIT="$(./gitlab-ci/src/artifacts/newest_sha_with_disk_image.sh origin/master)"`
4. `echo $IC_COMMIT`

The governance canister is installed by `dfx` when you run `dfx nns install`.
However, if there is a version of the canister in the dfx cache, that version
is the one that will be used. So we first need to remove the canister from the
cache and then run `dfx nns install`.

**Note**: If the last step below (`dfx nns install`) gives an error because it
can't download some canister (for example `lifeline.wasm`), you can copy that
canister back from the backup directory into the cache directory and try
again, as long as it isn't the governance canister itself.

1. `DFX_CACHE_DIR="$(dfx cache show)"`
2. `echo $DFX_CACHE_DIR`
3. `WASMS_BACKUP_DIR="$HOME/dfx-cache-wasms-backup-$(date +"%Y-%m-%d")"`
4. `echo $WASMS_BACKUP_DIR`
5. `mkdir -p "$WASMS_BACKUP_DIR"`
6. `mv $DFX_CACHE_DIR/wasms/* "$WASMS_BACKUP_DIR"`
7. `ls -l "$WASMS_BACKUP_DIR"`
8. `dfx start --clean  # This will continue running so continue from another terminal`
9. `echo $IC_COMMIT`
10. `DFX_IC_COMMIT=$IC_COMMIT dfx nns install`


### 4. Create a proposal with a payload for the new NNS function

You'll need to use `ic-admin` to create the proposal. Because the payload
type is new, your current version of `ic-admin` probably doesn't know about
it. So you should get a new version of `ic-admin`:

**Note**: For Linux, use
`https://download.dfinity.systems/ic/$IC_COMMIT/binaries/x86_64-linux/ic-admin.gz`
instead of the darwin URL.

1. `curl "https://download.dfinity.systems/ic/$IC_COMMIT/openssl-static-binaries/x86_64-darwin/ic-admin.gz" | gunzip > ic-admin`
2. `chmod +x ./ic-admin`
3. `./ic-admin --help`

Then you'll need the `ic-admin` command to create the new proposal. You might
be able to figure out the command from `ic-admin --help` but it's probably
easiest to ask someone on the NNS team or the person who asked you to add the
new proposal type. But for the `--nns-url` flag you should be able to use the
result of

```
NNS_URL="http://localhost:$(dfx info replica-port)"
echo $NNS_URL
```


### 5. Verify that it doesn't render correctly yet

In order to be able to see the difference later, it's a good idea to see how
the proposal renders without the required changes. You'll be able to see that
it doesn't cause errors but also doesn't render the payload correctly.

To be able to deploy `nns-dapp` locally, you need its canister ID in
`.dfx/local/canister_ids.json`. If it isn't already, make sure that
`.dfx/local/canister_ids.json` has at least the following:

```
{
  "nns-dapp": {
    "local": "qsgjb-riaaa-aaaaa-aaaga-cai"
  }
}
```

If the file/directory doesn't exist at all, create it with that content.

Then deploy `nns-dapp`:

1. Build the wasm. E.g.: `DFX_NETWORK=local ./build.sh`
2. Deploy the wasm. E.g.: `dfx canister install nns-dapp --wasm nns-dapp.wasm --upgrade-unchanged --mode reinstall -v --argument "$(cat nns-dapp-arg-local.did)"`

Now you can visit http://qsgjb-riaaa-aaaaa-aaaga-cai.localhost:8080/ and check
the proposal.


### 6. Make the code changes

#### Changes in ic-js

You'll need to make a 1-line change in the `ic-js`
[repositoy](https://github.com/dfinity/ic-js) to add the new NNS function to
the [NnsFunction
enum](https://github.com/dfinity/ic-js/blame/main/packages/nns/src/enums/governance.enums.ts#:~:text=export%20enum%20NnsFunction%20%7B)
in `packages/nns/src/enums/governance.enums.ts`. Use the name and number that
you noted down above in the section "Verify that the intended change is for a
new NNS function".

#### Changes in nns-dapp

You'll need to change the following files:

1. [rs/backend/Cargo.toml](https://github.com/dfinity/nns-dapp/blob/main/rs/backend/Cargo.toml)
2. [frontend/src/lib/i18n/en.governance.json](https://github.com/dfinity/nns-dapp/blob/main/frontend/src/lib/i18n/en.governance.json)
3.  [rs/backend/src/proposals.rs](https://github.com/dfinity/nns-dapp/blob/main/rs/backend/src/proposals.rs)

##### Cargo.toml

For each dependency that has `git = "https://github.com/dfinity/ic"`, change
the value of `rev =` to the commit you decided to use above in the section
"Install a new governance canister".

If the proposal type also depends on types in other packages and/or repos, you
may have to update/add those dependencies as well. To find out what exactly to
add do the following:

1. Find the file that has the type you need to depend on. For example for
`SetConfigRequest` from the bitcoin canister, this is
[https://github.com/dfinity/bitcoin-canister/blob/master/interface/src/lib.rs](
https://github.com/dfinity/bitcoin-canister/blob/master/interface/src/lib.rs#:~:text=pub%20struct%20SetConfigRequest%20%7B)
2. Then look for the `Cargo.toml` in the parent directory of the `/src/`
directory.
3. In the `Cargo.toml` file you should find the package name. For example for
[this Cargo.toml
file](https://github.com/dfinity/bitcoin-canister/blob/master/interface/Cargo.toml),
it's `ic-btc-interface`.
4. Use that name to add a line in `rs/backend/Cargo.toml` like this:
```
ic-btc-interface = { git = "https://github.com/dfinity/bitcoin-canister", rev="2c91aaae834dace5f1826ef41a910500d133d35e" }
```
5. But replace `ic-btc-interface` with the package name you found in step 3,
replace the `git =` value with the correct repo link, and replace the `rev =`
value with a revision that contains the changes that you need.
6. Once the changes to `Cargo.toml` have been made, run `cargo update` to
generate the required changes in `Cargo.lock`.

**Note**: The updated dependencies might have breaking changes which need to
be fixed when building nns-dapp later.

##### en.governance.json

In `en.governance.json`, you'll have to add entries to 2 different maps:
[nns_functions](https://github.com/dfinity/nns-dapp/blob/main/frontend/src/lib/i18n/en.governance.json#:~:text=%22nns_functions%22%3A%20%7B) and
[nns_functions_description](https://github.com/dfinity/nns-dapp/blob/main/frontend/src/lib/i18n/en.governance.json#:~:text=%22nns_functions_description%22%3A%20%7B).

As the key in both maps, use the name that you noted down before and also used
in the enum in the ic-js repo.

For `nns_functions` use a label that's more or less the enum value name but
human readable. For example, for `BitcoinSetConfig` use "Set Bitcoin Config".

For `nns_functions_description` you might be able to find a good description
as a comment on the [enum value definition](https://github.com/dfinity/ic/blame/master/rs/nns/governance/src/gen/ic_nns_governance.pb.v1.rs#:~:text=pub%20enum%20NnsFunction%20%7B).
If not, you'll just have to ask someone for a good description. This
description will be displayed when someone clicks on the (i) icon on the
proposal detail page.


##### proposals.rs

You will need to know the fully qualified name of the proposal type you are
adding. If you have the name of the type and the file it is defined in, you
find the fully qualified name as follows:

1. Find the package name as described in the `Cargo.toml` section above.
2. Take the directories under `/src/` on the path to the file.
3. If the filename is not `lib.rs`, take the filename as well.
4. Join everything from (1), (2), and (3) together with `::` and replace any
   hyphens with underscores.

For example for
[BitcoinSetConfigProposal](https://github.com/dfinity/ic/blame/ae00aff1373e9f6db375ff7076250a20bbf3eea0/rs/nns/governance/src/governance.rs#L8930),
you would get `ic_nns_governance::governance::BitcoinSetConfigProposal`.

If you're lucky, the new type can be used as-is. But in some cases a
transformation to the type is required to render it in a human readable way.

If no transformation is required:

1. Add a new entry to [match
nns_function](https://github.com/dfinity/nns-dapp/blob/main/rs/backend/src/proposals.rs#:~:text=match%20nns_function%20%7B).
  Use the number you noted down above in the section "Verify that the intended
  change is for a new NNS function". And use the (non-fully qualified) name of
  the new proposal type. For example:
```
38 => identity::<UpdateElectedReplicaVersionsPayload>(payload_bytes),
```
2. Add an entry at the bottom of the [mod def
section](https://github.com/dfinity/nns-dapp/blob/main/rs/backend/src/proposals.rs#:~:text=mod%20def%20%7B)
   to define the type, pointing to the fully qualified type you looked up
   above. For example:
```
// NNS function 38 - UpdateElectedReplicaVersions
/// The payload of a proposal to update elected replica versions.
// https://gitlab.com/dfinity-lab/public/ic/-/blob/90d82ff6e51a66306f9ddba820fcad984f4d85a5/rs/registry/canister/src/mutations/do_update_elected_replica_versions.rs#L193
pub type UpdateElectedReplicaVersionsPayload =
    registry_canister::mutations::do_update_elected_replica_versions::UpdateElectedReplicaVersionsPayload;
```

If a transformation is required:

1. Add a new entry to [match
nns_function](https://github.com/dfinity/nns-dapp/blob/main/rs/backend/src/proposals.rs#:~:text=match%20nns_function%20%7B).
  Use the number you noted down above in the section "Verify that the intended
  change is for a new NNS function". And use the (non-fully qualified) name of
  the new proposal type, and then repeat it with the `HumanReadable` suffix.
  For example:
```
39 => transform::<BitcoinSetConfigProposal, BitcoinSetConfigProposalHumanReadable>(payload_bytes),
```
2. Add an entry at the bottom of the [mod def
section](https://github.com/dfinity/nns-dapp/blob/main/rs/backend/src/proposals.rs#:~:text=mod%20def%20%7B)
   to define the type, pointing to the fully qualified type you looked up
   above. For example:
```
// NNS function 39 - BitcoinSetConfig
// https://github.com/dfinity/ic/blob/ae00aff1373e9f6db375ff7076250a20bbf3eea0/rs/nns/governance/src/governance.rs#L8930
pub type BitcoinSetConfigProposal = ic_nns_governance::governance::BitcoinSetConfigProposal;
```
3. Define the corresponding `HumanReadable` type. For example:
```
#[derive(CandidType, Serialize, Deserialize)]
pub struct BitcoinSetConfigProposalHumanReadable {
    pub network: ic_nns_governance::governance::BitcoinNetwork,
    pub set_config_request: ic_btc_interface::SetConfigRequest,
}
```
4. Implmement `From<ProposalType>` for `ProposalTypeHumanReadable`. For
   example:
```
impl From<BitcoinSetConfigProposal> for BitcoinSetConfigProposalHumanReadable {
    fn from(proposal: BitcoinSetConfigProposal) -> Self {
        let set_config_request: ic_btc_interface::SetConfigRequest = candid::decode_one(&proposal.payload).unwrap();
        BitcoinSetConfigProposalHumanReadable {
            network: proposal.network,
            set_config_request,
        }
    }
}
```


### 7. Verify that it does render correctly

Follow the steps from "Verify that it doesn't render correctly yet" above to
deploy the nns-dapp canister again and verify that now the proposal renders
correctly.
