import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";
import { SnsSwapLifecycle } from "@dfinity/sns";

// TS is not smart enough to infer the type from the JSON file.
export const aggregatorMockSnsesDataDto: CachedSnsDto[] =
  tenAggregatedSnses as unknown as CachedSnsDto[];

// It should match the token below
export const aggregatorTokenMock: IcrcTokenMetadata = {
  name: "CatalyzeDAO",
  symbol: "CAT",
  fee: 100000n,
};

export const aggregatorSnsMockDto: CachedSnsDto = {
  ...aggregatorMockSnsesDataDto[7],
};

// It should match the converted response from sns-aggregator.mock.json with the same `index` value

export const aggregatorSnsMockWith = ({
  rootCanisterId = "4nwps-saaaa-aaaaa-aabjq-cai",
  lifecycle = SnsSwapLifecycle.Committed,
}: {
  rootCanisterId?: string;
  lifecycle?: SnsSwapLifecycle;
}): CachedSnsDto => ({
  ...aggregatorSnsMockDto,
  canister_ids: {
    ...aggregatorSnsMockDto.canister_ids,
    root_canister_id: rootCanisterId,
  },
  swap_state: {
    ...aggregatorSnsMockDto.swap_state,
    swap: {
      ...aggregatorSnsMockDto.swap_state.swap,
      lifecycle,
    },
  },
});
