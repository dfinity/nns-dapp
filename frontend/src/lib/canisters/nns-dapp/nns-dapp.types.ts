import type { BlockHeight, E8s, NeuronId } from "@dfinity/nns";
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
export interface AddPendingNotifySwapRequest {
  swap_canister_id: Principal;
  from_sub_account: [] | [SubAccountArray];
}
export type AddPendingTransactionResponse = { Ok: null };
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
export type GetProposalPayloadResponse = { Ok: string } | { Err: string };
export interface GetTransactionsRequest {
  page_size: number;
  offset: number;
  account_identifier: AccountIdentifierString;
}
export interface GetTransactionsResponse {
  total: number;
  transactions: Array<Transaction>;
}
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
export interface ICPTs {
  e8s: E8s;
}
export interface MultiPartTransactionError {
  error_message: string;
  block_height: BlockHeight;
}
export type MultiPartTransactionStatus =
  | { Queued: null }
  | { Error: string }
  | { Refunded: [BlockHeight, string] }
  | { CanisterCreated: CanisterId }
  | { Complete: null }
  | { NotFound: null }
  | { NeuronCreated: NeuronId }
  | { PendingSync: null }
  | { ErrorWithRefundPending: string };
export interface Receive {
  fee: ICPTs;
  from: AccountIdentifierString;
  amount: ICPTs;
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
export interface RenameSubAccountRequest {
  new_name: string;
  account_identifier: AccountIdentifierString;
}
export type RenameSubAccountResponse =
  | { Ok: null }
  | { AccountNotFound: null }
  | { SubAccountNotFound: null }
  | { NameTooLong: null };
export interface Send {
  to: AccountIdentifierString;
  fee: ICPTs;
  amount: ICPTs;
}
export interface Stats {
  latest_transaction_block_height: BlockHeight;
  seconds_since_last_ledger_sync: bigint;
  sub_accounts_count: bigint;
  neurons_topped_up_count: bigint;
  transactions_to_process_queue_length: number;
  neurons_created_count: bigint;
  hardware_wallet_accounts_count: bigint;
  accounts_count: bigint;
  earliest_transaction_block_height: BlockHeight;
  transactions_count: bigint;
  block_height_synced_up_to: [] | [bigint];
  latest_transaction_timestamp_nanos: bigint;
  earliest_transaction_timestamp_nanos: bigint;
}
// ledger and account canisters in nns-js define a SubAccount as an object that contains the bytes array as a variable
// nns-dapp canister returns a string
export type SubAccountArray = Array<number>;
export interface SubAccountDetails {
  name: string;
  sub_account: SubAccountArray;
  account_identifier: AccountIdentifierString;
}
export interface Timestamp {
  timestamp_nanos: bigint;
}
export interface Transaction {
  transaction_type: [] | [TransactionType];
  memo: bigint;
  timestamp: Timestamp;
  block_height: BlockHeight;
  transfer: Transfer;
}
export type TransactionType =
  | { Burn: null }
  | { Mint: null }
  | { StakeNeuronNotification: null }
  | { TopUpCanister: CanisterId }
  | { ParticipateSwap: CanisterId }
  | { CreateCanister: null }
  | { Transfer: null }
  | { TopUpNeuron: null }
  | { StakeNeuron: null };
export type Transfer =
  | { Burn: { amount: ICPTs } }
  | { Mint: { amount: ICPTs } }
  | { Send: Send }
  | { Receive: Receive };
export default interface _SERVICE {
  add_account: () => Promise<AccountIdentifierString>;
  add_pending_notify_swap: (
    arg_0: AddPendingNotifySwapRequest
  ) => Promise<AddPendingTransactionResponse>;
  add_stable_asset: (arg_0: Array<number>) => Promise<undefined>;
  attach_canister: (
    arg_0: AttachCanisterRequest
  ) => Promise<AttachCanisterResponse>;
  create_sub_account: (arg_0: string) => Promise<CreateSubAccountResponse>;
  detach_canister: (
    arg_0: DetachCanisterRequest
  ) => Promise<DetachCanisterResponse>;
  get_account: () => Promise<GetAccountResponse>;
  get_canisters: () => Promise<Array<CanisterDetails>>;
  get_multi_part_transaction_errors: () => Promise<
    Array<MultiPartTransactionError>
  >;
  get_multi_part_transaction_status: (
    arg_0: Principal,
    arg_1: BlockHeight
  ) => Promise<MultiPartTransactionStatus>;
  get_proposal_payload: (arg_0: bigint) => Promise<GetProposalPayloadResponse>;
  get_stats: () => Promise<Stats>;
  get_transactions: (
    arg_0: GetTransactionsRequest
  ) => Promise<GetTransactionsResponse>;
  http_request: (arg_0: HttpRequest) => Promise<HttpResponse>;
  register_hardware_wallet: (
    arg_0: RegisterHardwareWalletRequest
  ) => Promise<RegisterHardwareWalletResponse>;
  rename_sub_account: (
    arg_0: RenameSubAccountRequest
  ) => Promise<RenameSubAccountResponse>;
}
