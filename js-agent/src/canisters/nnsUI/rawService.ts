export interface AccountDetails {
  'account_identifier' : AccountIdentifier,
  'hardware_wallet_accounts' : Array<HardwareWalletAccountDetails>,
  'sub_accounts' : Array<SubAccountDetails>,
};
export type AccountIdentifier = string;
export type BlockHeight = bigint;
export type CreateSubAccountResponse = { 'Ok' : SubAccountDetails } |
    { 'AccountNotFound' : null } |
    { 'SubAccountLimitExceeded' : null };
export type GetAccountResponse = { 'Ok' : AccountDetails } |
    { 'AccountNotFound' : null };
export interface GetTransactionsRequest {
  'page_size' : number,
  'offset' : number,
  'account_identifier' : AccountIdentifier,
};
export interface GetTransactionsResponse {
  'total' : number,
  'transactions' : Array<Transaction>,
};
export interface HardwareWalletAccountDetails {
  'name' : string,
  'account_identifier' : AccountIdentifier,
};
export interface ICPTs { 'e8s' : bigint };
export interface Receive {
  'fee' : ICPTs,
  'from' : AccountIdentifier,
  'amount' : ICPTs,
};
export interface RegisterHardwareWalletRequest {
  'name' : string,
  'account_identifier' : AccountIdentifier,
};
export type RegisterHardwareWalletResponse = { 'Ok' : null } |
    { 'AccountNotFound' : null } |
    { 'HardwareWalletLimitExceeded' : null };
export interface Send {
  'to' : AccountIdentifier,
  'fee' : ICPTs,
  'amount' : ICPTs,
};
export type SubAccount = Array<number>;
export interface SubAccountDetails {
  'name' : string,
  'sub_account' : SubAccount,
  'account_identifier' : AccountIdentifier,
};
export interface Timestamp { 'timestamp_nanos' : bigint };
export interface Transaction {
  'timestamp' : Timestamp,
  'block_height' : BlockHeight,
  'transfer' : Transfer,
};
export type Transfer = { 'Burn' : { 'amount' : ICPTs } } |
    { 'Mint' : { 'amount' : ICPTs } } |
    { 'Send' : Send } |
    { 'Receive' : Receive };
export default interface _SERVICE {
  'add_account' : () => Promise<AccountIdentifier>,
  'create_sub_account' : (arg_0: string) => Promise<CreateSubAccountResponse>,
  'get_account' : () => Promise<GetAccountResponse>,
  'get_transactions' : (arg_0: GetTransactionsRequest) => Promise<GetTransactionsResponse>,
  'register_hardware_wallet' : (arg_0: RegisterHardwareWalletRequest) => Promise<RegisterHardwareWalletResponse>,
  'sync_transactions' : () => Promise<undefined>,
};
