import { SNS_AGGREGATOR_CANISTER_URL } from "$lib/constants/environment.constants";
import { AGGREGATOR_CANISTER_VERSION } from "$lib/constants/sns.constants";
import type {
  CachedFunctionTypeDto,
  CachedLifecycleResponseDto,
  CachedNervousFunctionDto,
  CachedSns,
  CachedSnsDto,
  CachedSnsMetadataDto,
  CachedSnsSwapDerivedDto,
  CachedSnsSwapDto,
  CachedSnsTokenMetadataDto,
  CachedSwapInitParamsDto,
  CachedSwapParamsDto,
} from "$lib/types/sns-aggregator";
import type { IcrcTokenMetadataResponse } from "@dfinity/ledger";
import { Principal } from "@dfinity/principal";
import type {
  SnsFunctionType,
  SnsGetDerivedStateResponse,
  SnsGetLifecycleResponse,
  SnsGetMetadataResponse,
  SnsNervousSystemFunction,
  SnsParams,
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapInit,
} from "@dfinity/sns";
import { nonNullish, toNullable } from "@dfinity/utils";

const aggregatorCanisterLogoPath = (rootCanisterId: string) =>
  `${SNS_AGGREGATOR_CANISTER_URL}/${AGGREGATOR_CANISTER_VERSION}/sns/root/${rootCanisterId}/logo.png`;

const convertOptionalNumToBigInt = (
  num: number | undefined | null
): bigint | undefined => {
  return num === undefined || num === null ? undefined : BigInt(num);
};

const convertOptionalStringToOptionalPrincipal = (
  principalText: string | null | undefined
): [] | [Principal] => {
  return principalText === undefined || principalText === null
    ? []
    : [Principal.fromText(principalText)];
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

const convertFunctionType = (
  functionType: CachedFunctionTypeDto
): SnsFunctionType => {
  if ("NativeNervousSystemFunction" in functionType) {
    return { NativeNervousSystemFunction: {} };
  }
  const { GenericNervousSystemFunction } = functionType;
  return {
    GenericNervousSystemFunction: {
      validator_canister_id: convertOptionalStringToOptionalPrincipal(
        GenericNervousSystemFunction.validator_canister_id
      ),
      target_canister_id: convertOptionalStringToOptionalPrincipal(
        GenericNervousSystemFunction.target_canister_id
      ),
      validator_method_name: toNullable(
        GenericNervousSystemFunction.validator_method_name
      ),
      target_method_name: toNullable(
        GenericNervousSystemFunction.target_method_name
      ),
    },
  };
};

const convertNervousFuncttion = ({
  id,
  name,
  description,
  function_type,
}: CachedNervousFunctionDto): SnsNervousSystemFunction => ({
  id: BigInt(id),
  name: name,
  description: toNullable(description),
  function_type: toNullable(convertFunctionType(function_type)),
});

const convertSwapInitParams = (
  init: CachedSwapInitParamsDto
): [SnsSwapInit] | [] =>
  nonNullish(init)
    ? toNullable({
        neuron_minimum_stake_e8s: toNullable(
          convertOptionalNumToBigInt(init.neuron_minimum_stake_e8s)
        ),
        transaction_fee_e8s: toNullable(
          convertOptionalNumToBigInt(init.transaction_fee_e8s)
        ),
        confirmation_text: toNullable(init.confirmation_text),
        restricted_countries: toNullable(init.restricted_countries),
        sns_governance_canister_id: init.sns_governance_canister_id,
        sns_ledger_canister_id: init.sns_ledger_canister_id,
        sns_root_canister_id: init.sns_root_canister_id,
        fallback_controller_principal_ids:
          init.fallback_controller_principal_ids,
        nns_governance_canister_id: init.nns_governance_canister_id,
        icp_ledger_canister_id: init.icp_ledger_canister_id,
      })
    : [];

const convertSwapParams = (
  params: CachedSwapParamsDto | null | undefined
): [SnsParams] | [] =>
  nonNullish(params)
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
    : [];

const convertLifecycleResponse = (
  response: CachedLifecycleResponseDto
): SnsGetLifecycleResponse => ({
  decentralization_sale_open_timestamp_seconds: toNullable(
    convertOptionalNumToBigInt(
      response.decentralization_sale_open_timestamp_seconds
    )
  ),
  lifecycle: toNullable(response.lifecycle),
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
  init: convertSwapInitParams(init),
  params: convertSwapParams(params),
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

const convertDerivedToResponse = ({
  sns_tokens_per_icp,
  buyer_total_icp_e8s,
  cf_participant_count,
  direct_participant_count,
  cf_neuron_count,
}: CachedSnsSwapDerivedDto): SnsGetDerivedStateResponse => ({
  sns_tokens_per_icp: toNullable(sns_tokens_per_icp),
  buyer_total_icp_e8s: toNullable(
    convertOptionalNumToBigInt(buyer_total_icp_e8s)
  ),
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
    if ("Text" in value) {
      return [key, { Text: value.Text }];
    }
    if ("Nat64" in value) {
      return [key, { Nat: BigInt(value.Nat64[0]) }];
    }
    // We don't need nor support Blob, Array and Map yet
    return [key, { Text: "unsopported" }];
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
  derived_state,
  swap_params,
  init,
  lifecycle,
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
  derived_state: convertDerivedToResponse(derived_state),
  swap_params: {
    params: convertSwapParams(swap_params.params),
  },
  init: {
    init: convertSwapInitParams(init.init),
  },
  lifecycle: convertLifecycleResponse(lifecycle),
});

export const convertDtoData = (data: CachedSnsDto[]): CachedSns[] =>
  data.map(convertSnsData);
