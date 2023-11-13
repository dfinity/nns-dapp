import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
import { ICPToken } from "@dfinity/utils";

export const NNS_TOKEN_DATA = {
  ...ICPToken,
  fee: BigInt(DEFAULT_TRANSACTION_FEE_E8S),
};

export const NNS_TOKEN: TokensStoreUniverseData = {
  token: NNS_TOKEN_DATA,
  certified: true,
};
