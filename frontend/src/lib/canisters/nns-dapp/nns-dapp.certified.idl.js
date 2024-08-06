/* Do not edit.  Compiled with ./scripts/compile-idl-js from src/lib/canisters/nns-dapp/nns-dapp.did */
export const idlFactory = ({ IDL }) => {
  const AccountIdentifier = IDL.Text;
  const SubAccount = IDL.Vec(IDL.Nat8);
  const AttachCanisterRequest = IDL.Record({
    name: IDL.Text,
    canister_id: IDL.Principal,
  });
  const AttachCanisterResponse = IDL.Variant({
    Ok: IDL.Null,
    CanisterAlreadyAttached: IDL.Null,
    NameAlreadyTaken: IDL.Null,
    NameTooLong: IDL.Null,
    CanisterLimitExceeded: IDL.Null,
  });
  const SubAccountDetails = IDL.Record({
    name: IDL.Text,
    sub_account: SubAccount,
    account_identifier: AccountIdentifier,
  });
  const CreateSubAccountResponse = IDL.Variant({
    Ok: SubAccountDetails,
    AccountNotFound: IDL.Null,
    NameTooLong: IDL.Null,
    SubAccountLimitExceeded: IDL.Null,
  });
  const DetachCanisterRequest = IDL.Record({ canister_id: IDL.Principal });
  const DetachCanisterResponse = IDL.Variant({
    Ok: IDL.Null,
    CanisterNotFound: IDL.Null,
  });
  const HardwareWalletAccountDetails = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
    account_identifier: AccountIdentifier,
  });
  const AccountDetails = IDL.Record({
    principal: IDL.Principal,
    account_identifier: AccountIdentifier,
    hardware_wallet_accounts: IDL.Vec(HardwareWalletAccountDetails),
    sub_accounts: IDL.Vec(SubAccountDetails),
  });
  const GetAccountResponse = IDL.Variant({
    Ok: AccountDetails,
    AccountNotFound: IDL.Null,
  });
  const CanisterDetails = IDL.Record({
    name: IDL.Text,
    canister_id: IDL.Principal,
  });
  const ImportedToken = IDL.Record({
    index_canister_id: IDL.Opt(IDL.Principal),
    ledger_canister_id: IDL.Principal,
  });
  const ImportedTokens = IDL.Record({
    imported_tokens: IDL.Vec(ImportedToken),
  });
  const GetImportedTokensResponse = IDL.Variant({
    Ok: ImportedTokens,
    AccountNotFound: IDL.Null,
  });
  const BlockHeight = IDL.Nat64;
  const NeuronId = IDL.Nat64;
  const GetProposalPayloadResponse = IDL.Variant({
    Ok: IDL.Text,
    Err: IDL.Text,
  });
  const Stats = IDL.Record({
    seconds_since_last_ledger_sync: IDL.Nat64,
    sub_accounts_count: IDL.Nat64,
    neurons_topped_up_count: IDL.Nat64,
    transactions_to_process_queue_length: IDL.Nat32,
    neurons_created_count: IDL.Nat64,
    hardware_wallet_accounts_count: IDL.Nat64,
    accounts_count: IDL.Nat64,
    block_height_synced_up_to: IDL.Opt(IDL.Nat64),
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(HeaderField),
    status_code: IDL.Nat16,
  });
  const RegisterHardwareWalletRequest = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
  });
  const RegisterHardwareWalletResponse = IDL.Variant({
    Ok: IDL.Null,
    AccountNotFound: IDL.Null,
    HardwareWalletAlreadyRegistered: IDL.Null,
    HardwareWalletLimitExceeded: IDL.Null,
    NameTooLong: IDL.Null,
  });
  const RenameCanisterRequest = IDL.Record({
    name: IDL.Text,
    canister_id: IDL.Principal,
  });
  const RenameCanisterResponse = IDL.Variant({
    Ok: IDL.Null,
    CanisterNotFound: IDL.Null,
    AccountNotFound: IDL.Null,
    NameAlreadyTaken: IDL.Null,
    NameTooLong: IDL.Null,
  });
  const RenameSubAccountRequest = IDL.Record({
    new_name: IDL.Text,
    account_identifier: AccountIdentifier,
  });
  const RenameSubAccountResponse = IDL.Variant({
    Ok: IDL.Null,
    AccountNotFound: IDL.Null,
    SubAccountNotFound: IDL.Null,
    NameTooLong: IDL.Null,
  });
  const SetImportedTokensResponse = IDL.Variant({
    Ok: IDL.Null,
    AccountNotFound: IDL.Null,
    TooManyImportedTokens: IDL.Record({ limit: IDL.Int32 }),
  });
  return IDL.Service({
    add_account: IDL.Func([], [AccountIdentifier], []),
    add_stable_asset: IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    attach_canister: IDL.Func(
      [AttachCanisterRequest],
      [AttachCanisterResponse],
      []
    ),
    rename_canister: IDL.Func(
      [RenameCanisterRequest],
      [RenameCanisterResponse],
      []
    ),
    create_sub_account: IDL.Func([IDL.Text], [CreateSubAccountResponse], []),
    detach_canister: IDL.Func(
      [DetachCanisterRequest],
      [DetachCanisterResponse],
      []
    ),
    get_account: IDL.Func([], [GetAccountResponse], []),
    get_canisters: IDL.Func([], [IDL.Vec(CanisterDetails)], []),
    get_imported_tokens: IDL.Func([], [GetImportedTokensResponse], []),
    get_proposal_payload: IDL.Func(
      [IDL.Nat64],
      [GetProposalPayloadResponse],
      []
    ),
    get_stats: IDL.Func([], [Stats], []),
    http_request: IDL.Func([HttpRequest], [HttpResponse], []),
    register_hardware_wallet: IDL.Func(
      [RegisterHardwareWalletRequest],
      [RegisterHardwareWalletResponse],
      []
    ),
    rename_sub_account: IDL.Func(
      [RenameSubAccountRequest],
      [RenameSubAccountResponse],
      []
    ),
    set_imported_tokens: IDL.Func(
      [ImportedTokens],
      [SetImportedTokensResponse],
      []
    ),
  });
};
// Remove param `{ IDL }` because TS was complaining of unused variable
export const init = () => {
  return [];
};
