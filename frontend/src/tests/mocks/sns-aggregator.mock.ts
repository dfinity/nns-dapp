import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  CachedNervousFunctionDto,
  CachedSns,
  CachedSnsDto,
  CachedSnsTokenMetadataDto,
} from "$lib/types/sns-aggregator";
import tenAggregatedSnses from "$tests/mocks/sns-aggregator.mock.json";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger";
import { SnsSwapLifecycle, type SnsNervousSystemFunction } from "@dfinity/sns";
import { fromNullable, nonNullish } from "@dfinity/utils";
import { mockQueryTokenResponse } from "./sns-projects.mock";

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
export const aggregatorSnsMock: CachedSns = {
  index: 7,
  canister_ids: {
    root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
    governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
    index_canister_id: "5tw34-2iaaa-aaaaq-aaa6q-cai",
    swap_canister_id: "5ux5i-xqaaa-aaaaq-aaa6a-cai",
    ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
  },
  list_sns_canisters: {
    root: "5psbn-niaaa-aaaaq-aaa4q-cai",
    swap: "5ux5i-xqaaa-aaaaq-aaa6a-cai",
    ledger: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
    index: "5tw34-2iaaa-aaaaq-aaa6q-cai",
    governance: "5grkr-3aaaa-aaaaq-aaa5a-cai",
    dapps: [
      "7xnbj-wqaaa-aaaap-aa4ea-cai",
      "5escj-6iaaa-aaaap-aa4kq-cai",
      "443xk-qiaaa-aaaap-aa4oq-cai",
      "4sz2c-lyaaa-aaaap-aa4pq-cai",
      "zjdgt-niaaa-aaaap-aa4qq-cai",
      "zhbl3-wyaaa-aaaap-aa4rq-cai",
    ],
    archives: [],
  },
  meta: {
    url: ["https://catalyze.one"],
    name: ["Catalyze"],
    description: [
      "Catalyze is a one-stop social-fi application for organising your Web3 experience",
    ],
    logo: [
      "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/5psbn-niaaa-aaaaq-aaa4q-cai/logo.png",
    ],
  },
  parameters: {
    reserved_ids: [],
    functions: [
      {
        id: 0n,
        name: "All Topics",
        description: [
          "Catch-all w.r.t to following for all types of proposals.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 1n,
        name: "Motion",
        description: [
          "Side-effect-less proposals to set general governance direction.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 2n,
        name: "Manage nervous system parameters",
        description: [
          "Proposal to change the core parameters of SNS governance.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 3n,
        name: "Upgrade SNS controlled canister",
        description: [
          "Proposal to upgrade the wasm of an SNS controlled canister.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 4n,
        name: "Add nervous system function",
        description: [
          "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 5n,
        name: "Remove nervous system function",
        description: [
          "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 6n,
        name: "Execute nervous system function",
        description: [
          "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 7n,
        name: "Upgrade SNS to next version",
        description: ["Proposal to upgrade the WASM of a core SNS canister."],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 8n,
        name: "Manage SNS metadata",
        description: [
          "Proposal to change the metadata associated with an SNS.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 9n,
        name: "Transfer SNS treasury funds",
        description: [
          "Proposal to transfer funds from an SNS Governance controlled treasury account",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 10n,
        name: "Register dapp canisters",
        description: ["Proposal to register a dapp canister with the SNS."],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: 11n,
        name: "Deregister Dapp Canisters",
        description: [
          "Proposal to deregister a previously-registered dapp canister from the SNS.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
    ],
  },
  swap_state: {
    swap: {
      auto_finalize_swap_response: [],
      neuron_recipes: [],
      next_ticket_id: [],
      finalize_swap_in_progress: [],
      cf_participants: [],
      purge_old_tickets_last_completion_timestamp_nanoseconds: [],
      purge_old_tickets_next_principal: [],
      buyers: [],
      lifecycle: 2,
      init: [
        {
          nns_proposal_id: [],
          min_participant_icp_e8s: [],
          neuron_basket_construction_parameters: [],
          max_icp_e8s: [],
          swap_start_timestamp_seconds: [],
          swap_due_timestamp_seconds: [],
          min_participants: [],
          sns_token_e8s: [],
          should_auto_finalize: [],
          neurons_fund_participants: [],
          max_participant_icp_e8s: [],
          min_icp_e8s: [],
          sns_root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
          fallback_controller_principal_ids: [
            "ledm3-52ncq-rffuv-6ed44-hg5uo-iicyu-pwkzj-syfva-heo4k-p7itq-aqe",
            "efaeg-aiaaa-aaaap-aan6a-cai",
          ],
          neuron_minimum_stake_e8s: [400000000n],
          confirmation_text: [],
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: [100000n],
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
          sns_governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
          restricted_countries: [{ iso_codes: ["US"] }],
          neurons_fund_participation_constraints: [],
        },
      ],
      already_tried_to_auto_finalize: [],
      params: [
        {
          min_participant_icp_e8s: 100000000n,
          neuron_basket_construction_parameters: [
            {
              dissolve_delay_interval_seconds: 5259486n,
              count: 7n,
            },
          ],
          max_icp_e8s: 130000000000000n,
          swap_due_timestamp_seconds: 1691785258n,
          min_participants: 125,
          sns_token_e8s: 11250000000000000n,
          sale_delay_seconds: [],
          max_participant_icp_e8s: 15000000000000n,
          min_icp_e8s: 65000000000000n,
        },
      ],
      open_sns_token_swap_proposal_id: [123772n],
      decentralization_sale_open_timestamp_seconds: [1690786778n],
      direct_participation_icp_e8s: [],
      neurons_fund_participation_icp_e8s: [],
    },
    derived: {
      buyer_total_icp_e8s: 50669291278205n,
      sns_tokens_per_icp: 222.02797,
      cf_neuron_count: [],
      cf_participant_count: [],
      direct_participant_count: [],
      direct_participation_icp_e8s: [],
      neurons_fund_participation_icp_e8s: [],
    },
  },
  icrc1_metadata: [
    ["icrc1:decimals", { Nat: 8n }],
    ["icrc1:name", { Text: "CatalyzeDAO" }],
    ["icrc1:symbol", { Text: "CAT" }],
    ["icrc1:fee", { Nat: 100000n }],
  ],
  icrc1_fee: 100000n,
  icrc1_total_supply: 50000000000000000n,
  derived_state: {
    sns_tokens_per_icp: [222.02796936035156],
    buyer_total_icp_e8s: [50669291278205n],
    cf_participant_count: [145n],
    direct_participant_count: [224n],
    cf_neuron_count: [178n],
    direct_participation_icp_e8s: [],
    neurons_fund_participation_icp_e8s: [],
  },
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
