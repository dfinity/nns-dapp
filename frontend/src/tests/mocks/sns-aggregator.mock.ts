import type { CachedSns } from "$lib/api/sns-aggregator.api";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";

export const aggregatorTokenMock: IcrcTokenMetadata = {
  name: "Community Fund Demo",
  symbol: "CFD",
  fee: BigInt(1000),
};

// It should match the converted response from sns-aggregator.mock.json with the same `index` value
export const aggregatorSnsMock: CachedSns = {
  index: 11,
  canister_ids: {
    root_canister_id: "4nwps-saaaa-aaaaa-aabjq-cai",
    governance_canister_id: "4yr67-tiaaa-aaaaa-aabka-cai",
    ledger_canister_id: "47qyl-6qaaa-aaaaa-aabkq-cai",
    swap_canister_id: "4wttx-iyaaa-aaaaa-aabla-cai",
    index_canister_id: "4rsvd-faaaa-aaaaa-aablq-cai",
  },
  list_sns_canisters: {
    root: "4nwps-saaaa-aaaaa-aabjq-cai",
    governance: "4yr67-tiaaa-aaaaa-aabka-cai",
    ledger: "47qyl-6qaaa-aaaaa-aabkq-cai",
    swap: "4wttx-iyaaa-aaaaa-aabla-cai",
    dapps: [],
    archives: [],
    index: "4rsvd-faaaa-aaaaa-aablq-cai",
  },
  meta: {
    url: ["https://sqbzf-5aaaa-aaaam-aavya-cai.ic0.app/"],
    name: ["Community Fund Demo"],
    description: ["This is my awesome project"],
    logo: [
      "https://5v72r-4aaaa-aaaaa-aabnq-cai.raw.small12.testnet.dfinity.network/v1/sns/root/4nwps-saaaa-aaaaa-aabjq-cai/logo.png",
    ],
  },
  parameters: {
    functions: [
      {
        id: BigInt(0),
        name: "Unspecified",
        description: [
          "Catch-all w.r.t to following for all types of proposals.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: BigInt(1),
        name: "Motion",
        description: [
          "Side-effect-less proposals to set general governance direction.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: BigInt(2),
        name: "Manage nervous system parameters",
        description: [
          "Proposal to change the core parameters of SNS governance.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: BigInt(3),
        name: "Upgrade SNS controlled canister",
        description: [
          "Proposal to upgrade the wasm of an SNS controlled canister.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: BigInt(4),
        name: "Add nervous system function",
        description: [
          "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
      {
        id: BigInt(5),
        name: "Remove nervous system function",
        description: [
          "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      },
    ],
    reserved_ids: [],
  },
  swap_state: {
    swap: {
      lifecycle: SnsSwapLifecycle.Committed,
      decentralization_sale_open_timestamp_seconds: [BigInt(1234)],
      finalize_swap_in_progress: [false],
      buyers: [],
      init: [
        {
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          sns_governance_canister_id: "4yr67-tiaaa-aaaaa-aabka-cai",
          sns_ledger_canister_id: "47qyl-6qaaa-aaaaa-aabkq-cai",
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_root_canister_id: "4nwps-saaaa-aaaaa-aabjq-cai",
          fallback_controller_principal_ids: [
            "dvxsz-v7mxb-wr2nb-dse2o-iw3pg-kjtll-riew5-y2g2t-olovx-vaeyn-lqe",
          ],
          transaction_fee_e8s: [BigInt(1000)],
          neuron_minimum_stake_e8s: [BigInt(1000000)],
          confirmation_text: ["I agree"],
          restricted_countries: [{ iso_codes: ["US"] }],
        },
      ],
      neuron_recipes: [],
      cf_participants: [],
      params: [
        {
          min_participants: 1,
          min_icp_e8s: BigInt(5000000000),
          max_icp_e8s: BigInt(314100000000),
          min_participant_icp_e8s: BigInt(10000000),
          max_participant_icp_e8s: BigInt(314100000000),
          swap_due_timestamp_seconds: BigInt(1674664463),
          sns_token_e8s: BigInt(314100000000),
          neuron_basket_construction_parameters: [
            {
              count: BigInt(2),
              dissolve_delay_interval_seconds: BigInt(2629800),
            },
          ],
          sale_delay_seconds: [BigInt(1234)],
        },
      ],
      open_sns_token_swap_proposal_id: [BigInt(120)],
      next_ticket_id: [],
      purge_old_tickets_last_completion_timestamp_nanoseconds: [],
      purge_old_tickets_next_principal: [],
    },
    derived: {
      buyer_total_icp_e8s: BigInt(314100000000),
      sns_tokens_per_icp: 1.0,
      cf_participant_count: [BigInt(100)],
      direct_participant_count: [BigInt(300)],
      cf_neuron_count: [BigInt(200)],
    },
  },
  icrc1_metadata: [
    ["icrc1:decimals", { Nat: BigInt(8) }],
    ["icrc1:name", { Text: aggregatorTokenMock.name }],
    ["icrc1:symbol", { Text: aggregatorTokenMock.symbol }],
    ["icrc1:fee", { Nat: aggregatorTokenMock.fee }],
  ],
  icrc1_fee: aggregatorTokenMock.fee,
  icrc1_total_supply: BigInt(1100_000_000_000),
  derived_state: {
    sns_tokens_per_icp: [2.0],
    buyer_total_icp_e8s: [100500000010n],
    cf_participant_count: [0n],
    direct_participant_count: [4n],
    cf_neuron_count: [0n],
  },
};

export const aggregatorSnsMockWith = ({
  rootCanisterId = "4nwps-saaaa-aaaaa-aabjq-cai",
  lifecycle = SnsSwapLifecycle.Committed,
}: {
  rootCanisterId: string;
  lifecycle: SnsSwapLifecycle;
}): CachedSns => ({
  ...aggregatorSnsMock,
  canister_ids: {
    ...aggregatorSnsMock.canister_ids,
    root_canister_id: rootCanisterId,
  },
  swap_state: {
    ...aggregatorSnsMock.swap_state,
    swap: {
      ...aggregatorSnsMock.swap_state.swap,
      lifecycle,
    },
  },
});
