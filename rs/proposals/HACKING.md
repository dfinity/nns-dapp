# Hacking the Proposal Payload Renderer

## Rendering a proposal

Suppose that you wish to change the way a given proposal type is rendered, or you need to add a new proposal type. The recommended flow is as follows:

### Get a sample proposal

#### From mainnet

If a suitable proposal has been made on mainnet:

```
PROPOSAL=123456 # Please replace this with the proposal you wish to work on

dfx canister call nns-governance --network ic get_proposal_info "($PROPOSAL : nat64)" --query --output raw > proposal-$PROPOSAL-info.did
```

This should give you a file filled with candid expressed as hex.

#### From upstream

If a proposal of the type you are interested in has not been made on mainnet, please contact the NNS team and ask for a sample `proposal_info` in hex format.

### Change code

Make any changes you wish to the proposal payload rendering crate. For example:

#### Update canister APIs

If the APIs of canisters controlled by the NNS have changed, proposal payloads may change. To update the rendering, the typical route is as follows. Please note that there may be changes depending on the canister and the nature of the update.

- Pick [a recent release of the `IC` repository](https://github.com/dfinity/ic/tags) that contains the changes you care about. Alternatively you may chose a commit, but release tags are preferred as their age is obvious.
- Update the relevant `.did` files under `declarations` in the root of this repository.
  - You can upgrade all `.did` files that come from the IC repository by running: `./scripts/update_ic_commit -c THE_RELEASE_TAG`
    - Note: The above routine is likely to change soon. When it does, the command above needs to be updated.
    - Note: The command may require some manual intervention if the upstream changes are too radical.
  - You can update just a few canisters by manually by getting the corresponding `.did` files from the relevant upstream repositories. You will have to make any corresponding changes manually.
- Update the rust code derived from the `.did` files by running: `./scripts/proposals/did2rs` Alternatively, run the "Update Proposals" GitHub action.

### Test the changes

To see how your shiny new code renders the proposal you obtained earlier, use the CLI:

```
cargo run --bin proposals < proposal-$PROPOSAL-info.did
```

This should build your code, then print JSON.

## Rendering many proposals

You may wish to download and render many proposals, for example to compare your modified code with production to ensure that there are no unintended changes. There is a tool for that.

First build your code:

```
cargo build -p proposals
```

Then download and render one proposal:

```
scripts/proposals/mk-test-vector --network mainnet --proposal 123456
```

When that works as expected, download and render a range of proposal payloads:

```
seq 90000 90100 | xargs -I {} scripts/proposals/mk-test-vector --network mainnet --proposal {}
```

Note: To minimize load on the network:

- Downloads are cached but the rendering is not cached, so if you change the code no additional network calls are needed to render the payloads.
- Downloads are by (uncertified) query calls, so place relatively little load on the network. The sheer size of the payloads may however stress the network connection.
