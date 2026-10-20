# NNS dapp API

The NNS dapp canister serves the NNS dapp web app. It also keeps the account
data of each user: sub-account names, hardware wallets, linked canisters,
imported tokens, favorite projects, and an address book.

This canister holds no tokens. No method of this canister transfers tokens,
charges a fee, or changes a neuron. The ICP ledger and the NNS governance
canisters keep the balances and the neurons.

## Identity

- The canister keys each account by the principal of the caller.
- Internet Identity derives this principal for one origin. If the app serves
  `/.well-known/ii-derivation-origin`, the web app uses the origin in that
  file. If not, the web app uses the origin that the user visits. A principal
  for a different origin has a different, empty account.
- Each method that reads or changes account data rejects the anonymous
  principal. The call traps.
- `get_stats`, `get_histogram`, `get_tvl`, `http_request`, `add_stable_asset`,
  and `get_api_doc` accept the anonymous principal.

## Account setup

- `add_account` (update) creates the account of the caller. If the account
  exists, the call changes nothing. The call returns the ICP account identifier
  of the caller principal with the default sub-account.
- Until `add_account` runs, the other account methods return `AccountNotFound`,
  and `get_canisters` returns an empty list.
- `get_account` (query) returns the account identifier, the sub-accounts, and
  the hardware wallets of the caller.

## Units and formats

- An `AccountIdentifier` is the 64-character hex text of an ICP ledger account
  identifier.
- A `SubAccount` has 32 bytes.
- A `block_index` is the index of the ICP ledger block that the user gave to
  `notify_create_canister` on the cycles minting canister.
- The name limits below count UTF-8 bytes, not characters.

## Query calls

Query responses are not certified. If a read decides where tokens go, for
example an address from `get_address_book` or an account identifier from
`get_account`, make the same call as an update call. An update call goes
through consensus.

## Methods that change state

All of these are update calls. Each call changes only the data of the caller.

- `create_sub_account` adds a sub-account with a name of 24 bytes or fewer. An
  account has 254 sub-accounts or fewer. No method deletes a sub-account.
- `rename_sub_account` changes the name of a sub-account. It finds the
  sub-account by its `account_identifier`. The new name has 24 bytes or fewer.
- `register_hardware_wallet` links the principal of a hardware wallet to the
  account, with a name of 24 bytes or fewer. An account has 255 hardware
  wallets or fewer. No method removes a hardware wallet. The link gives no
  control of the hardware wallet: each call from the hardware wallet principal
  needs a signature from the device.
- `attach_canister` adds a canister to the list of the caller, with a name of
  64 bytes or fewer. A name that is not empty must be unique in the list. The
  list holds 255 canisters or fewer. The call does not change the canister or
  its controllers.
- `rename_canister` changes the name of a canister in the list.
- `detach_canister` removes a canister from the list. The call does not change
  or delete the canister.
- `set_imported_tokens`, `set_fav_projects`, and `set_address_book` replace the
  full list. Each list holds 20 entries or fewer. An entry that is not in the
  new list is deleted. To change one entry, read the list with the matching
  `get_imported_tokens`, `get_fav_projects`, or `get_address_book` query, and
  then send the full changed list.
- `set_imported_tokens` keeps the `ledger_canister_id` and the optional
  `index_canister_id` of each ICRC-1 token.
- `set_fav_projects` keeps the `root_canister_id` of each SNS.
- `set_address_book` trims each name and changes each sequence of whitespace
  to one space. Then each name must have 3 to 64 bytes and be unique. An `Icp`
  address is a hex account identifier. An `Icrc1` address is the ICRC-1 text
  format, with a valid checksum.

## Public methods

- `get_stats` (query) returns the number of accounts, sub-accounts, and
  hardware wallets, the memory sizes, and the instruction counts.
- `get_histogram` (query) returns `accounts_count` and three histograms of all
  accounts: the number of sub-accounts, hardware wallets, and canisters per
  account. The buckets are logarithmic. Each key is the upper limit of its
  bucket: key 0 is 0 items, key 1 is 1 item, key 3 is 2 to 3 items, key 7 is
  4 to 7 items, and so on. Each value is the number of accounts in the bucket.
  It traps if you call it as an update. It is for ad-hoc analysis, and a
  future release can remove it.
- `get_tvl` (query) returns `tvl`, the value of the ICP in NNS neurons in whole
  USD, and `time_sec`, the Unix time in seconds of the ICP/USD exchange rate.
- `http_request` (query) serves the files of the web app.
- `add_stable_asset` (update) accepts only two fixed files, which it identifies
  by their hash. It traps for every other file.
- `get_api_doc` (query) returns this text.

## Methods of test builds

The Candid interface also declares `create_toy_accounts` and
`get_toy_account`. Only test builds export them, so a call to the production
canister fails. In a test build, only a controller can call them.
