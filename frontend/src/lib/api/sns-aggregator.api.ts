import { SNS_AGGREGATOR_CANISTER_URL } from "$lib/constants/environment.constants";
import {
  AGGREGATOR_CANISTER_PATH,
  AGGREGATOR_CANISTER_VERSION,
} from "$lib/constants/sns.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type {
  IcrcMetadataResponseEntries,
  IcrcTokenMetadataResponse,
} from "@dfinity/ledger";
import type {
  SnsFunctionType,
  SnsGetMetadataResponse,
  SnsNervousSystemFunction,
  SnsSwap,
  SnsSwapDerivedState,
} from "@dfinity/sns";
import { nonNullish, toNullable } from "@dfinity/utils";

const aggregatorCanisterLogoPath = (rootCanisterId: string) =>
  `${SNS_AGGREGATOR_CANISTER_URL}/${AGGREGATOR_CANISTER_VERSION}/sns/root/${rootCanisterId}/logo.png`;

type CanisterIds = {
  root_canister_id: string;
  governance_canister_id: string;
  ledger_canister_id: string;
  swap_canister_id: string;
  index_canister_id: string;
};

type ListSnsCanisterIds = {
  root: string;
  governance: string;
  ledger: string;
  swap: string;
  dapps: string[];
  archives: [];
  index: string;
};

// TODO: Create types with script https://dfinity.atlassian.net/browse/GIX-1249
export type CachedSns = {
  index: number;
  canister_ids: CanisterIds;
  list_sns_canisters: ListSnsCanisterIds;
  meta: SnsGetMetadataResponse;
  parameters: {
    functions: SnsNervousSystemFunction[];
    reserved_ids: bigint[];
  };
  swap_state: {
    swap: SnsSwap;
    derived: SnsSwapDerivedState;
  };
  icrc1_metadata: IcrcTokenMetadataResponse;
  /**
   * TODO: integrate ckBTC fee
   * @deprecated we will use the icrc1_metadata.fee as source information for the fee
   */
  icrc1_fee?: bigint;
  icrc1_total_supply: bigint;
};

type CachedSnsMetadataDto = {
  url: string;
  name: string;
  description: string;
};

type CachedNervousFunctionDto = {
  id: number;
  name: string;
  description: string;
  function_type: SnsFunctionType;
};

type CachedCountriesDto = {
  iso_codes: string[];
};

type CachedSnsSwapDto = {
  lifecycle: number;
  decentralization_sale_open_timestamp_seconds?: number;
  finalize_swap_in_progress?: boolean;
  init: {
    nns_governance_canister_id: string;
    sns_governance_canister_id: string;
    sns_ledger_canister_id: string;
    icp_ledger_canister_id: string;
    sns_root_canister_id: string;
    fallback_controller_principal_ids: string[];
    transaction_fee_e8s: number;
    neuron_minimum_stake_e8s: number;
    confirmation_text?: string | undefined;
    restricted_countries?: CachedCountriesDto | undefined;
  };
  params: {
    min_participants: number;
    min_icp_e8s: number;
    max_icp_e8s: number;
    min_participant_icp_e8s: number;
    max_participant_icp_e8s: number;
    swap_due_timestamp_seconds: number;
    sns_token_e8s: number;
    neuron_basket_construction_parameters: {
      count: number;
      dissolve_delay_interval_seconds: number;
    };
    sale_delay_seconds?: number;
  };
  open_sns_token_swap_proposal_id: number;
};

type CachedSnsSwapDerivedDto = {
  buyer_total_icp_e8s: number;
  sns_tokens_per_icp: number;
  cf_participant_count: number | undefined;
  direct_participant_count: number | undefined;
  cf_neuron_count: number | undefined;
};

type CachedSnsTokenMetadataDto = [
  string | IcrcMetadataResponseEntries,
  (
    | { Int: [number] }
    | { Nat: [number] }
    | { Blob: Uint8Array }
    | { Text: string }
  )
][];

type CachedSnsDto = {
  index: number;
  canister_ids: CanisterIds;
  list_sns_canisters: ListSnsCanisterIds;
  meta: CachedSnsMetadataDto;
  parameters: {
    functions: CachedNervousFunctionDto[];
    reserved_ids: bigint[];
  };
  swap_state: {
    swap: CachedSnsSwapDto;
    derived: CachedSnsSwapDerivedDto;
  };
  icrc1_metadata: CachedSnsTokenMetadataDto;
  icrc1_fee: [] | [number];
  icrc1_total_supply: number;
};

const convertOptionalNumToBigInt = (
  num: number | undefined
): bigint | undefined => {
  return num === undefined || num === null ? undefined : BigInt(num);
};

const convertMeta = (
  { url, name, description }: CachedSnsMetadataDto,
  rootCanisterId: string
): SnsGetMetadataResponse => ({
  url: toNullable(url),
  name: toNullable(name),
  description: toNullable(description),
  logo: toNullable(aggregatorCanisterLogoPath(rootCanisterId)),
});

const convertNervousFuncttion = ({
  id,
  name,
  description,
  function_type,
}: CachedNervousFunctionDto): SnsNervousSystemFunction => ({
  id: BigInt(id),
  name: name,
  description: toNullable(description),
  function_type: toNullable(function_type),
});

const convertSwap = ({
  lifecycle,
  open_sns_token_swap_proposal_id,
  init,
  params,
  decentralization_sale_open_timestamp_seconds,
  finalize_swap_in_progress,
}: CachedSnsSwapDto): SnsSwap => ({
  lifecycle,
  // TODO: Ask to Max, why isn't it there?
  neuron_recipes: [],
  // TODO: extend when needed
  next_ticket_id: [],
  purge_old_tickets_last_completion_timestamp_nanoseconds: [],
  purge_old_tickets_next_principal: [],
  // TODO: Ask to Max, why isn't it there?
  cf_participants: [],
  decentralization_sale_open_timestamp_seconds: toNullable(
    convertOptionalNumToBigInt(decentralization_sale_open_timestamp_seconds)
  ),
  // TODO: Upgrade @dfinity/utils and use the fix for the optional boolean
  finalize_swap_in_progress:
    finalize_swap_in_progress === undefined ? [] : [finalize_swap_in_progress],
  buyers: [],
  open_sns_token_swap_proposal_id:
    open_sns_token_swap_proposal_id !== undefined
      ? toNullable(convertOptionalNumToBigInt(open_sns_token_swap_proposal_id))
      : [],
  init: nonNullish(init)
    ? toNullable({
        ...init,
        neuron_minimum_stake_e8s: toNullable(
          convertOptionalNumToBigInt(init.neuron_minimum_stake_e8s)
        ),
        transaction_fee_e8s: toNullable(
          convertOptionalNumToBigInt(init.transaction_fee_e8s)
        ),
        confirmation_text: toNullable(init.confirmation_text),
        restricted_countries: toNullable(init.restricted_countries),
      })
    : [],
  params: nonNullish(params)
    ? toNullable({
        min_participant_icp_e8s: BigInt(params.min_participant_icp_e8s),
        max_icp_e8s: BigInt(params.max_icp_e8s),
        min_icp_e8s: BigInt(params.min_icp_e8s),
        sns_token_e8s: BigInt(params.sns_token_e8s),
        min_participants: params.min_participants,
        max_participant_icp_e8s: BigInt(params.max_participant_icp_e8s),
        swap_due_timestamp_seconds: BigInt(params.swap_due_timestamp_seconds),
        neuron_basket_construction_parameters: toNullable({
          dissolve_delay_interval_seconds: BigInt(
            params.neuron_basket_construction_parameters
              .dissolve_delay_interval_seconds
          ),
          count: BigInt(params.neuron_basket_construction_parameters.count),
        }),
        sale_delay_seconds: toNullable(
          convertOptionalNumToBigInt(params.sale_delay_seconds)
        ),
      })
    : [],
});

const convertDerived = ({
  sns_tokens_per_icp,
  buyer_total_icp_e8s,
  cf_participant_count,
  direct_participant_count,
  cf_neuron_count,
}: CachedSnsSwapDerivedDto): SnsSwapDerivedState => ({
  sns_tokens_per_icp,
  buyer_total_icp_e8s: BigInt(buyer_total_icp_e8s),
  cf_participant_count: nonNullish(cf_participant_count)
    ? toNullable(BigInt(cf_participant_count))
    : [],
  direct_participant_count: nonNullish(direct_participant_count)
    ? toNullable(BigInt(direct_participant_count))
    : [],
  cf_neuron_count: nonNullish(cf_neuron_count)
    ? toNullable(BigInt(cf_neuron_count))
    : [],
});

const convertIcrc1Metadata = (
  icrc1Metadata: CachedSnsTokenMetadataDto
): IcrcTokenMetadataResponse => {
  return icrc1Metadata.map(([key, value]) => {
    if ("Int" in value) {
      return [key, { Int: BigInt(value.Int[0]) }];
    }
    if ("Nat" in value) {
      return [key, { Nat: BigInt(value.Nat[0]) }];
    }
    return [key, value];
  });
};

const convertSnsData = ({
  index,
  canister_ids,
  list_sns_canisters,
  meta,
  parameters,
  swap_state,
  icrc1_metadata,
  icrc1_fee,
  icrc1_total_supply,
}: CachedSnsDto): CachedSns => ({
  index,
  canister_ids,
  list_sns_canisters,
  meta: convertMeta(meta, canister_ids.root_canister_id),
  parameters: {
    functions: parameters.functions.map(convertNervousFuncttion),
    reserved_ids: parameters.reserved_ids.map(BigInt),
  },
  swap_state: {
    swap: convertSwap(swap_state.swap),
    derived: convertDerived(swap_state.derived),
  },
  icrc1_metadata: convertIcrc1Metadata(icrc1_metadata),
  icrc1_fee: convertOptionalNumToBigInt(icrc1_fee[0]),
  icrc1_total_supply: BigInt(icrc1_total_supply),
});

const convertDtoData = (data: CachedSnsDto[]): CachedSns[] =>
  data.map(convertSnsData);

export const querySnsProjects = async (): Promise<CachedSns[]> => {
  logWithTimestamp("Loading SNS projects from aggregator canister...");
  const response = await fetch(
    `${SNS_AGGREGATOR_CANISTER_URL}/${AGGREGATOR_CANISTER_VERSION}${AGGREGATOR_CANISTER_PATH}`
  );
  if (!response.ok) {
    throw new Error("Error loading SNS projects from aggregator canister");
  }
  try {
    const data: CachedSnsDto[] = await response.json();
    const convertedData = convertDtoData(data);
    logWithTimestamp("Loading SNS projects from aggregator canister completed");
    return convertedData;
  } catch (err) {
    console.error("Error converting data", err);
    throw new Error("Error converting data from aggregator canister");
  }
};
