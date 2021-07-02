export const SUB_ACCOUNT_BYTE_LENGTH = 32;
export const CREATE_CANISTER_MEMO = BigInt(0x41455243); // CREA,
export const TOP_UP_CANISTER_MEMO = BigInt(0x50555054); // TPUP
import config from "../config.json";

// @ts-ignore
export const HOST = "HOST" in config ? config["HOST"] : undefined;
