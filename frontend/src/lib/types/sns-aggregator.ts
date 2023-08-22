import type {
  IcrcMetadataResponseEntries,
  IcrcTokenMetadataResponse,
} from "@dfinity/ledger";
import type {
  SnsGetDerivedStateResponse,
  SnsGetMetadataResponse,
  SnsNervousSystemFunction,
  SnsSwap,
  SnsSwapDerivedState,
} from "@dfinity/sns";

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
  archives: string[];
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
  derived_state: SnsGetDerivedStateResponse;
};

export type CachedSnsMetadataDto = {
  url: string;
  name: string;
  description: string;
};

interface GenericNervousSystemFunctionDto {
  validator_canister_id: string | null;
  target_canister_id: string | null;
  validator_method_name: string | null;
  target_method_name: string | null;
}

export type CachedFunctionTypeDto =
  | { NativeNervousSystemFunction: Record<never, never> }
  | { GenericNervousSystemFunction: GenericNervousSystemFunctionDto };

export type CachedNervousFunctionDto = {
  id: number;
  name: string;
  description: string;
  function_type: CachedFunctionTypeDto;
};

type CachedCountriesDto = {
  iso_codes: string[];
};

export type CachedSwapParamsDto = {
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

// TODO: update when the candid is updated with the new init params
export type CachedSwapInitParamsDto = {
  // TODO: Recheck after next governance canister upgrade ~2023-08-14 (currently the aggregator returns null for next `null |` params)
  nns_proposal_id: null | number;
  max_icp_e8s: null | number;
  swap_start_timestamp_seconds: null | number;
  swap_due_timestamp_seconds: null | number;
  min_participants: null | number;
  sns_token_e8s: null | number;
  neurons_fund_participants: null | {
    // NeuronsFundParticipants
    cf_participants: Array<{
      // CfParticipant
      hotkey_principal: string;
      cf_neurons: Array<{
        // CfNeuron
        nns_neuron_id: number;
        amount_icp_e8s: number;
      }>;
    }>;
  };
  should_auto_finalize: null | boolean;
  max_participant_icp_e8s: null | number;
  min_icp_e8s: null | number;
  min_participant_icp_e8s: null | number;
  neuron_basket_construction_parameters: null | {
    dissolve_delay_interval_seconds: number;
    count: number;
  };
  //
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

export type CachedSnsSwapDto = {
  lifecycle: number;
  decentralization_sale_open_timestamp_seconds?: number;
  finalize_swap_in_progress?: boolean;
  init: CachedSwapInitParamsDto;
  params: CachedSwapParamsDto;
  open_sns_token_swap_proposal_id: number;
};

export type CachedSnsSwapDerivedDto = {
  buyer_total_icp_e8s: number;
  sns_tokens_per_icp: number;
  cf_participant_count?: number | undefined | null;
  direct_participant_count?: number | undefined | null;
  cf_neuron_count?: number | undefined | null;
};

type CachedSwapParamsResponseDto = {
  params: CachedSwapParamsDto | null;
};

type CachedInitResponseDto = {
  init: CachedSwapInitParamsDto;
};

export type CachedLifecycleResponseDto = {
  decentralization_sale_open_timestamp_seconds: number | null;
  lifecycle: number | null;
};

// Export for testing purposes
export type CachedSnsTokenMetadataDto = [
  string | IcrcMetadataResponseEntries,
  (
    | { Int: [number] }
    | { Nat: [number] }
    | { Blob: Uint8Array }
    | { Text: string }
  )
][];

// Export for testing purposes
export type CachedSnsDto = {
  index: number;
  canister_ids: CanisterIds;
  list_sns_canisters: ListSnsCanisterIds;
  meta: CachedSnsMetadataDto;
  parameters: {
    functions: CachedNervousFunctionDto[];
    reserved_ids: number[];
  };
  // @deprecated
  swap_state: {
    swap: CachedSnsSwapDto;
    derived: CachedSnsSwapDerivedDto;
  };
  icrc1_metadata: CachedSnsTokenMetadataDto;
  icrc1_fee: [] | [number];
  icrc1_total_supply: number;
  derived_state: CachedSnsSwapDerivedDto;
  swap_params: CachedSwapParamsResponseDto;
  init: CachedInitResponseDto;
  lifecycle: CachedLifecycleResponseDto;
};
