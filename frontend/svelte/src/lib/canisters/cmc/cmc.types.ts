import type { Principal } from "@dfinity/principal";
export type BlockIndex = bigint;
export type Cycles = bigint;
export interface IcpXdrConversionRate {
  xdr_permyriad_per_icp: bigint;
  timestamp_seconds: bigint;
}
export interface IcpXdrConversionRateResponse {
  certificate: Array<number>;
  data: IcpXdrConversionRate;
  hash_tree: Array<number>;
}
export interface NotifyCreateCanisterArg {
  controller: Principal;
  block_index: BlockIndex;
}
export type NotifyCreateCanisterResult =
  | { Ok: Principal }
  | { Err: NotifyError };
export type NotifyError =
  | {
      Refunded: { block_index: [] | [BlockIndex]; reason: string };
    }
  | { InvalidTransaction: string }
  | { Other: { error_message: string; error_code: bigint } }
  | { Processing: null }
  | { TransactionTooOld: BlockIndex };
export interface NotifyTopUpArg {
  block_index: BlockIndex;
  canister_id: Principal;
}
export type NotifyTopUpResult = { Ok: Cycles } | { Err: NotifyError };
export interface _SERVICE {
  get_icp_xdr_conversion_rate: () => Promise<IcpXdrConversionRateResponse>;
  notify_create_canister: (
    arg_0: NotifyCreateCanisterArg
  ) => Promise<NotifyCreateCanisterResult>;
  notify_top_up: (arg_0: NotifyTopUpArg) => Promise<NotifyTopUpResult>;
}
