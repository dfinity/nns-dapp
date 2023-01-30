import type { TokenMetadata } from "$lib/types/token";
import { ICPToken } from "@dfinity/nns";

export const HARDWARE_WALLET_NAME_MIN_LENGTH = 2;

export const ICP_TOKEN_METADATA: TokenMetadata = {
  name: ICPToken.name,
  symbol: ICPToken.symbol,
};
