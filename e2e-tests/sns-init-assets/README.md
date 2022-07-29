# SNS Init Assets

These identities and init files are used when interacting with an SNS deployed to a testnet. As such, these identities are
not for use in production, and using one in production will result in no gain.

### Contents

- 8 x `.pem` files used by sns-quill (1-4 are used in `sns_init.yaml`, the other 5-8 are for undefined use)
- 8 x `seed.txt` files used to generate corresponding `.pem` files
- `sns-canisters.json` used with `sns-quill` to sign messages to the specific SNS
- `dfx.json` used to point at the deployed testnet
- `sns_init.yaml` used to configure the deployed SNS

### Configuration

`sns_init.yaml` is structured in such a way that the identities provided in this directory will have certain
testable roles within the provisioned SNS. The SNS will be created with

- An SNS Ledger `transaction_fee` of 0.0001 Token (10000 E8s)
- A proposal rejection fee of 1 Token (100000000 E8s)
- A neuron minimum stake of 1 Token (100000000 E8s)
- A decentralization swap configured to:
  - Accept a max of 5 ICP
  - Require a min of 1 ICP to succeed
  - Require at least 1 participant to succeed
  - Require a min of 1 ICP per participant
  - Accept a max of 1 ICP per participant
- A dapp fallback controller configured to `hpikg-6exdt-jn33w-ndty3-fc7jc-tl2lr-buih3-cs3y7-tftkp-sfp62-gqe` (identity-1.pem)
- An initial token distribution configured to:
  - 1 Token in a Developer neuron belonging to `hpikg-6exdt-jn33w-ndty3-fc7jc-tl2lr-buih3-cs3y7-tftkp-sfp62-gqe` (identity-2.pem)
  - 1 Token in an Airdropped neuron belonging to `w3i5o-5ylvd-cmm42-pw66i-n6qcw-fw3q7-kk5la-4edui-ozozq-5qq3j-dae` (identity-3.pem)
  - A treasury bucket with 10 Tokens
  - An initial swap with 2 Tokens for swapping
  - A reserve of 8 Tokens for future swaps
- An account in the NNS Ledger `cf36661f8287be559ffccd4876617f953d76f1bb1c34e83229b0caaf713557b4` (identity-4.pem) with 25 ICP

### Clients

`sns-quill` and the nns-dapp are the main clients of this SNS. To use the identities
included in this dir, use `sns-quill`.

[Download and build](https://github.com/dfinity/sns-quill) sns-quill from GitHub. Use the `IC_URL` environmental
variable to point at the testnet in use. For example, using the testnet configured in the included `dfx.json`,

```bash
IC_URL=http://[2a00:fb01:400:42:5000:d1ff:fefe:987e]:8080 sns-quill
```

With the binary in your path, you can run any sns-quill command. For example, you can validate the principals in the
sns_init.yaml correspond to the identities:

```bash
$ sns-quill --pem-file identity-1.pem public-ids
Principal id: hpikg-6exdt-jn33w-ndty3-fc7jc-tl2lr-buih3-cs3y7-tftkp-sfp62-gqe
Account id: 2b8fbde99de881f695f279d2a892b1137bfe81a42d7694e064b1be58701e1138
```

Other commands for using these identities can be found by running

```bash
$ sns-quill --help
```
