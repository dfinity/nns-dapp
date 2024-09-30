import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  CachedNervousFunctionDto,
  CachedSnsDto,
  CachedSnsTokenMetadataDto,
} from "$lib/types/sns-aggregator";
import { convertDtoToTokenMetadata } from "$lib/utils/sns-aggregator-converters.utils";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle, type SnsNervousSystemFunction } from "@dfinity/sns";
import { fromNullable, nonNullish } from "@dfinity/utils";
import { mockQueryTokenResponse } from "./sns-projects.mock";

export const aggregatorMockSnsesDataDto: CachedSnsDto[] = tenAggregatedSnses;

export const aggregatorSnsMockDto: CachedSnsDto = {
  // This is the YRAL (fka HotOrNot) SNS.
  // We picked this as a suitable mock because:
  // 1. It was not aborted.
  // 2. It was not sold out, so it doesn't prevent testing additional sales.
  // 3. It did not have restricted countries.
  // But any test that depends on specific values should declare those
  // explcitily in the test.
  ...aggregatorMockSnsesDataDto[4],
};

// It should match the token in the aggregatorSnsMockDto above.
export const aggregatorTokenMock: IcrcTokenMetadata = convertDtoToTokenMetadata(
  aggregatorSnsMockDto.icrc1_metadata
);

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
  fee,
  logo,
}: Partial<
  Pick<IcrcTokenMetadata, "name" | "symbol" | "fee" | "logo">
>): CachedSnsTokenMetadataDto =>
  mockQueryTokenResponse.map(([key, value]) => {
    if (key === IcrcMetadataResponseEntries.NAME) {
      return [key, { Text: name }];
    }
    if (key === IcrcMetadataResponseEntries.SYMBOL) {
      return [key, { Text: symbol }];
    }
    if (key === IcrcMetadataResponseEntries.LOGO && "Text" in value) {
      return [key, { Text: logo ?? value.Text }];
    }
    if (key === IcrcMetadataResponseEntries.DECIMALS && "Nat" in value) {
      return [key, { Nat: [Number(value.Nat)] }];
    }
    if (key === IcrcMetadataResponseEntries.FEE && "Nat" in value) {
      return [key, { Nat: [Number(fee ?? value.Nat)] }];
    }
    throw new Error(`The key ${key} is not supported yet.`);
  });

export const aggregatorSnsMockWith = ({
  rootCanisterId = "4nwps-saaaa-aaaaa-aabjq-cai",
  governanceCanisterId = "5grkr-3aaaa-aaaaq-aaa5a-cai",
  ledgerCanisterId = "5bqmf-wyaaa-aaaaq-aaa5q-cai",
  indexCanisterId = "5tw34-2iaaa-aaaaq-aaa6q-cai",
  swapCanisterId = "5ux5i-xqaaa-aaaaq-aaa6a-cai",
  lifecycle = SnsSwapLifecycle.Committed,
  restrictedCountries,
  directParticipantCount,
  projectName,
  tokenMetadata,
  index,
  nervousFunctions,
  swapDueTimestampSeconds,
  nnsProposalId,
  totalTokenSupply,
  neuronMinimumDissolveDelayToVoteSeconds,
  maxDissolveDelaySeconds,
  maxDissolveDelayBonusPercentage,
  maxAgeBonusPercentage,
  neuronMinimumStakeE8s,
}: {
  rootCanisterId?: string;
  governanceCanisterId?: string;
  ledgerCanisterId?: string;
  indexCanisterId?: string;
  swapCanisterId?: string;
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
  totalTokenSupply?: bigint;
  neuronMinimumDissolveDelayToVoteSeconds?: bigint;
  maxDissolveDelaySeconds?: bigint;
  maxDissolveDelayBonusPercentage?: number;
  maxAgeBonusPercentage?: number;
  neuronMinimumStakeE8s?: bigint;
}): CachedSnsDto => ({
  index: index ?? aggregatorSnsMockDto.index,
  ...aggregatorSnsMockDto,
  canister_ids: {
    ...aggregatorSnsMockDto.canister_ids,
    root_canister_id: rootCanisterId,
    governance_canister_id: governanceCanisterId,
    ledger_canister_id: ledgerCanisterId,
    index_canister_id: indexCanisterId,
    swap_canister_id: swapCanisterId,
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
        ? (Number(directParticipantCount[0]) ?? null)
        : aggregatorSnsMockDto.swap_state.derived.direct_participant_count,
    },
  },
  icrc1_total_supply: nonNullish(totalTokenSupply)
    ? Number(totalTokenSupply)
    : aggregatorSnsMockDto.icrc1_total_supply,
  parameters: {
    ...aggregatorSnsMockDto.parameters,
    functions:
      nervousFunctions?.map(convertToNervousFunctionDto) ??
      aggregatorSnsMockDto.parameters.functions,
  },
  nervous_system_parameters: {
    ...aggregatorSnsMockDto.nervous_system_parameters,
    neuron_minimum_dissolve_delay_to_vote_seconds: nonNullish(
      neuronMinimumDissolveDelayToVoteSeconds
    )
      ? Number(neuronMinimumDissolveDelayToVoteSeconds)
      : aggregatorSnsMockDto.nervous_system_parameters
          .neuron_minimum_dissolve_delay_to_vote_seconds,
    max_dissolve_delay_seconds: nonNullish(maxDissolveDelaySeconds)
      ? Number(maxDissolveDelaySeconds)
      : aggregatorSnsMockDto.nervous_system_parameters
          .max_dissolve_delay_seconds,
    max_dissolve_delay_bonus_percentage:
      maxDissolveDelayBonusPercentage ??
      aggregatorSnsMockDto.nervous_system_parameters
        .max_dissolve_delay_bonus_percentage,
    max_age_bonus_percentage:
      maxAgeBonusPercentage ??
      aggregatorSnsMockDto.nervous_system_parameters.max_age_bonus_percentage,
    neuron_minimum_stake_e8s: nonNullish(neuronMinimumStakeE8s)
      ? Number(neuronMinimumStakeE8s)
      : aggregatorSnsMockDto.nervous_system_parameters.neuron_minimum_stake_e8s,
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
      ? (Number(directParticipantCount[0]) ?? null)
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
