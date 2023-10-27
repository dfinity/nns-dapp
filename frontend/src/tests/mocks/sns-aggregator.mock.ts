import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  CachedNervousFunctionDto,
  CachedSnsDto,
  CachedSnsTokenMetadataDto,
} from "$lib/types/sns-aggregator";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle, type SnsNervousSystemFunction } from "@dfinity/sns";
import { fromNullable, nonNullish } from "@dfinity/utils";
import { mockQueryTokenResponse } from "./sns-projects.mock";

export const aggregatorMockSnsesDataDto: CachedSnsDto[] = tenAggregatedSnses;

// It should match the token below
export const aggregatorTokenMock: IcrcTokenMetadata = {
  name: "CatalyzeDAO",
  symbol: "CAT",
  fee: 100000n,
};

export const aggregatorSnsMockDto: CachedSnsDto = {
  ...aggregatorMockSnsesDataDto[7],
};

const convertToNervousFunctionDto = ({
  id,
  name,
  description,
}: SnsNervousSystemFunction): CachedNervousFunctionDto => ({
  id: Number(id),
  name,
  description: fromNullable(description),
  // Not necessary to convert this, it's not used
  function_type: { NativeNervousSystemFunction: {} },
});

const createQueryMetadataResponse = ({
  name,
  symbol,
}: Partial<
  Pick<IcrcTokenMetadata, "name" | "symbol">
>): CachedSnsTokenMetadataDto =>
  mockQueryTokenResponse.map(([key, value]) => {
    if (key === IcrcMetadataResponseEntries.NAME) {
      return [key, { Text: name }];
    }
    if (key === IcrcMetadataResponseEntries.SYMBOL) {
      return [key, { Text: symbol }];
    }
    if (key === IcrcMetadataResponseEntries.DECIMALS && "Nat" in value) {
      return [key, { Nat: [Number(value.Nat)] }];
    }
    if (key === IcrcMetadataResponseEntries.FEE && "Nat" in value) {
      return [key, { Nat: [Number(value.Nat)] }];
    }
    throw new Error(`The key ${key} is not supported yet.`);
  });

export const aggregatorSnsMockWith = ({
  rootCanisterId = "4nwps-saaaa-aaaaa-aabjq-cai",
  lifecycle = SnsSwapLifecycle.Committed,
  restrictedCountries,
  directParticipantCount,
  projectName,
  tokenMetadata,
  index,
  nervousFunctions,
  swapDueTimestampSeconds,
  nnsProposalId,
}: {
  rootCanisterId?: string;
  lifecycle?: SnsSwapLifecycle;
  restrictedCountries?: string[];
  // TODO: Change to `undefined` or `number`.
  directParticipantCount?: [] | [bigint];
  projectName?: string;
  tokenMetadata?: Partial<IcrcTokenMetadata>;
  index?: number;
  nervousFunctions?: SnsNervousSystemFunction[];
  swapDueTimestampSeconds?: number;
  nnsProposalId?: number;
}): CachedSnsDto => ({
  index: index ?? aggregatorSnsMockDto.index,
  ...aggregatorSnsMockDto,
  canister_ids: {
    ...aggregatorSnsMockDto.canister_ids,
    root_canister_id: rootCanisterId,
  },
  list_sns_canisters: {
    ...aggregatorSnsMockDto.list_sns_canisters,
    root: rootCanisterId,
  },
  swap_state: {
    ...aggregatorSnsMockDto.swap_state,
    swap: {
      ...aggregatorSnsMockDto.swap_state.swap,
      lifecycle,
      init: {
        ...aggregatorSnsMockDto.swap_state.swap.init,
        restricted_countries: nonNullish(restrictedCountries)
          ? { iso_codes: restrictedCountries }
          : aggregatorSnsMockDto.swap_state.swap.init.restricted_countries,
      },
      params: {
        ...aggregatorSnsMockDto.swap_state.swap.params,
        swap_due_timestamp_seconds:
          swapDueTimestampSeconds ??
          aggregatorSnsMockDto.swap_state.swap.params
            .swap_due_timestamp_seconds,
      },
    },
    derived: {
      ...aggregatorSnsMockDto.swap_state.derived,
      direct_participant_count: nonNullish(directParticipantCount?.[0])
        ? Number(directParticipantCount[0]) ?? null
        : aggregatorSnsMockDto.swap_state.derived.direct_participant_count,
    },
  },
  parameters: {
    ...aggregatorSnsMockDto.parameters,
    functions:
      nervousFunctions?.map(convertToNervousFunctionDto) ??
      aggregatorSnsMockDto.parameters.functions,
  },
  meta: {
    ...aggregatorSnsMockDto.meta,
    name: projectName ?? aggregatorSnsMockDto.meta.name,
  },
  init: {
    init: {
      ...aggregatorSnsMockDto.init.init,
      restricted_countries: nonNullish(restrictedCountries)
        ? { iso_codes: restrictedCountries }
        : aggregatorSnsMockDto.swap_state.swap.init.restricted_countries,
      swap_due_timestamp_seconds:
        swapDueTimestampSeconds ??
        aggregatorSnsMockDto.swap_state.swap.params.swap_due_timestamp_seconds,
      nns_proposal_id:
        nnsProposalId ?? aggregatorSnsMockDto.init.init.nns_proposal_id,
    },
  },
  swap_params: {
    params: {
      ...aggregatorSnsMockDto.swap_params.params,
      swap_due_timestamp_seconds:
        swapDueTimestampSeconds ??
        aggregatorSnsMockDto.swap_state.swap.params.swap_due_timestamp_seconds,
    },
  },
  derived_state: {
    ...aggregatorSnsMockDto.derived_state,
    direct_participant_count: nonNullish(directParticipantCount?.[0])
      ? Number(directParticipantCount[0]) ?? null
      : aggregatorSnsMockDto.swap_state.derived.direct_participant_count,
  },
  icrc1_metadata: nonNullish(tokenMetadata)
    ? createQueryMetadataResponse(tokenMetadata)
    : aggregatorSnsMockDto.icrc1_metadata,
  lifecycle: {
    ...aggregatorSnsMockDto.lifecycle,
    lifecycle: lifecycle ?? aggregatorSnsMockDto.lifecycle.lifecycle,
  },
});
