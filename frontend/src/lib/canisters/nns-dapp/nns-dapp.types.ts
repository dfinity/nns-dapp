import type { ActorMethod } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
export interface AccountDetails {
  principal: Principal;
  account_identifier: AccountIdentifierString;
  hardware_wallet_accounts: Array<HardwareWalletAccountDetails>;
  sub_accounts: Array<SubAccountDetails>;
}
// ledger and account canisters in nns-js define a AccountIdentifier as an object that contains the bytes array as a variable
// nns-dapp canister returns a string
export type AccountIdentifierString = string;
export interface AttachCanisterRequest {
  name: string;
  canister_id: Principal;
}
export type AttachCanisterResponse =
  | { Ok: null }
  | { CanisterAlreadyAttached: null }
  | { NameAlreadyTaken: null }
  | { NameTooLong: null }
  | { CanisterLimitExceeded: null };
export interface CanisterDetails {
  name: string;
  canister_id: CanisterId;
}
export type CanisterId = Principal;
export type CreateSubAccountResponse =
  | { Ok: SubAccountDetails }
  | { AccountNotFound: null }
  | { NameTooLong: null }
  | { SubAccountLimitExceeded: null };
export interface DetachCanisterRequest {
  canister_id: Principal;
}
export type DetachCanisterResponse = { Ok: null } | { CanisterNotFound: null };
export type GetAccountResponse =
  | { Ok: AccountDetails }
  | { AccountNotFound: null };
export type GetImportedTokensResponse =
  | { Ok: ImportedTokens }
  | { AccountNotFound: null };
export type GetProposalPayloadResponse = { Ok: string } | { Err: string };
export interface HardwareWalletAccountDetails {
  principal: Principal;
  name: string;
  account_identifier: AccountIdentifierString;
}
export type HeaderField = [string, string];
export interface HttpRequest {
  url: string;
  method: string;
  body: Array<number>;
  headers: Array<HeaderField>;
}
export interface HttpResponse {
  body: Array<number>;
  headers: Array<HeaderField>;
  status_code: number;
}
export interface ImportedToken {
  index_canister_id: [] | [Principal];
  ledger_canister_id: Principal;
}
export interface ImportedTokens {
  imported_tokens: Array<ImportedToken>;
}
export interface RegisterHardwareWalletRequest {
  principal: Principal;
  name: string;
}
export type RegisterHardwareWalletResponse =
  | { Ok: null }
  | { AccountNotFound: null }
  | { HardwareWalletAlreadyRegistered: null }
  | { HardwareWalletLimitExceeded: null }
  | { NameTooLong: null };
export interface RenameCanisterRequest {
  name: string;
  canister_id: Principal;
}
export type RenameCanisterResponse =
  | { Ok: null }
  | { CanisterNotFound: null }
  | { AccountNotFound: null }
  | { NameAlreadyTaken: null }
  | { NameTooLong: null };
export interface RenameSubAccountRequest {
  new_name: string;
  account_identifier: AccountIdentifierString;
}
export type RenameSubAccountResponse =
  | { Ok: null }
  | { AccountNotFound: null }
  | { SubAccountNotFound: null }
  | { NameTooLong: null };
export type SetImportedTokensResponse =
  | { Ok: null }
  | { AccountNotFound: null }
  | { TooManyImportedTokens: { limit: number } };
export interface Stats {
  seconds_since_last_ledger_sync: bigint;
  sub_accounts_count: bigint;
  neurons_topped_up_count: bigint;
  transactions_to_process_queue_length: number;
  neurons_created_count: bigint;
  hardware_wallet_accounts_count: bigint;
  accounts_count: bigint;
  block_height_synced_up_to: [] | [bigint];
}
// ledger and account canisters in nns-js define a SubAccount as an object that contains the bytes array as a variable
// nns-dapp canister returns a string
export type SubAccountArray = Array<number>;
export interface SubAccountDetails {
  name: string;
  sub_account: SubAccountArray;
  account_identifier: AccountIdentifierString;
}
export default interface _SERVICE {
  add_account: () => Promise<AccountIdentifierString>;
  add_stable_asset: (arg_0: Array<number>) => Promise<undefined>;
  attach_canister: (
    arg_0: AttachCanisterRequest
  ) => Promise<AttachCanisterResponse>;
  rename_canister: (
    arg_0: RenameCanisterRequest
  ) => Promise<RenameCanisterResponse>;
  create_sub_account: (arg_0: string) => Promise<CreateSubAccountResponse>;
  detach_canister: (
    arg_0: DetachCanisterRequest
  ) => Promise<DetachCanisterResponse>;
  get_account: () => Promise<GetAccountResponse>;
  get_canisters: () => Promise<Array<CanisterDetails>>;
  get_imported_tokens: () => Promise<GetImportedTokensResponse>;
  get_proposal_payload: (arg_0: bigint) => Promise<GetProposalPayloadResponse>;
  get_stats: () => Promise<Stats>;
  http_request: (arg_0: HttpRequest) => Promise<HttpResponse>;
  register_hardware_wallet: (
    arg_0: RegisterHardwareWalletRequest
  ) => Promise<RegisterHardwareWalletResponse>;
  rename_sub_account: (
    arg_0: RenameSubAccountRequest
  ) => Promise<RenameSubAccountResponse>;
  set_imported_tokens: ActorMethod<[ImportedTokens], SetImportedTokensResponse>;
}
