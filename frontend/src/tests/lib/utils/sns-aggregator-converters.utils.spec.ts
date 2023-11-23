import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import {
  convertDtoToSnsSummary,
  convertIcrc1Metadata,
  convertNervousFunction,
} from "$lib/utils/sns-aggregator-converters.utils";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { Principal } from "@dfinity/principal";

describe("sns aggregator converters utils", () => {
  describe("convertDtoData", () => {
    it("converts aggregator icrc metadata to ic-js types", () => {
      expect(convertIcrc1Metadata(aggregatorSnsMockDto.icrc1_metadata)).toEqual(
        [
          ["icrc1:decimals", { Nat: 8n }],
          ["icrc1:name", { Text: "CatalyzeDAO" }],
          ["icrc1:symbol", { Text: "CAT" }],
          ["icrc1:fee", { Nat: 100000n }],
        ]
      );
    });

    it("converts aggregator nervous function to ic-js types", () => {
      expect(
        convertNervousFunction(aggregatorSnsMockDto.parameters.functions[1])
      ).toEqual({
        id: 1n,
        name: "Motion",
        description: [
          "Side-effect-less proposals to set general governance direction.",
        ],
        function_type: [
          {
            NativeNervousSystemFunction: {},
          },
        ],
      });
    });
  });

  describe("convertDtoToSnsSummary", () => {
    const mockData: CachedSnsDto = {
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
        url: "https://catalyze.one",
        name: "Catalyze",
        description:
          "Catalyze is a one-stop social-fi application for organising your Web3 experience",
      },
      parameters: {
        reserved_ids: [],
        functions: [
          {
            id: 0,
            name: "All Topics",
            description:
              "Catch-all w.r.t to following for all types of proposals.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 1,
            name: "Motion",
            description:
              "Side-effect-less proposals to set general governance direction.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 2,
            name: "Manage nervous system parameters",
            description:
              "Proposal to change the core parameters of SNS governance.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 3,
            name: "Upgrade SNS controlled canister",
            description:
              "Proposal to upgrade the wasm of an SNS controlled canister.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 4,
            name: "Add nervous system function",
            description:
              "Proposal to add a new, user-defined, nervous system function:a canister call which can then be executed by proposal.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 5,
            name: "Remove nervous system function",
            description:
              "Proposal to remove a user-defined nervous system function,which will be no longer executable by proposal.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 6,
            name: "Execute nervous system function",
            description:
              "Proposal to execute a user-defined nervous system function,previously added by an AddNervousSystemFunction proposal. A canister call will be made when executed.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 7,
            name: "Upgrade SNS to next version",
            description: "Proposal to upgrade the WASM of a core SNS canister.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 8,
            name: "Manage SNS metadata",
            description:
              "Proposal to change the metadata associated with an SNS.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 9,
            name: "Transfer SNS treasury funds",
            description:
              "Proposal to transfer funds from an SNS Governance controlled treasury account",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 10,
            name: "Register dapp canisters",
            description: "Proposal to register a dapp canister with the SNS.",
            function_type: { NativeNervousSystemFunction: {} },
          },
          {
            id: 11,
            name: "Deregister Dapp Canisters",
            description:
              "Proposal to deregister a previously-registered dapp canister from the SNS.",
            function_type: { NativeNervousSystemFunction: {} },
          },
        ],
      },
      swap_state: {
        swap: {
          lifecycle: 2,
          init: {
            nns_proposal_id: null,
            sns_root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
            min_participant_icp_e8s: null,
            neuron_basket_construction_parameters: null,
            fallback_controller_principal_ids: [
              "ledm3-52ncq-rffuv-6ed44-hg5uo-iicyu-pwkzj-syfva-heo4k-p7itq-aqe",
              "efaeg-aiaaa-aaaap-aan6a-cai",
            ],
            max_icp_e8s: null,
            neuron_minimum_stake_e8s: 400000000,
            confirmation_text: null,
            swap_start_timestamp_seconds: null,
            swap_due_timestamp_seconds: null,
            min_participants: null,
            sns_token_e8s: null,
            nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
            transaction_fee_e8s: 100000,
            icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
            sns_ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
            neurons_fund_participants: null,
            should_auto_finalize: null,
            max_participant_icp_e8s: null,
            sns_governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
            restricted_countries: { iso_codes: ["US"] },
            min_icp_e8s: null,
          },
          params: {
            min_participant_icp_e8s: 100000000,
            neuron_basket_construction_parameters: {
              dissolve_delay_interval_seconds: 5259486,
              count: 7,
            },
            max_icp_e8s: 130000000000000,
            swap_due_timestamp_seconds: 1691785258,
            min_participants: 125,
            sns_token_e8s: 11250000000000000,
            sale_delay_seconds: null,
            max_participant_icp_e8s: 15000000000000,
            min_icp_e8s: 65000000000000,
          },
          open_sns_token_swap_proposal_id: 123772,
          decentralization_sale_open_timestamp_seconds: 1690786778,
        },
        derived: {
          buyer_total_icp_e8s: 50669291278205,
          sns_tokens_per_icp: 222.02797,
        },
      },
      icrc1_metadata: [
        ["icrc1:decimals", { Nat: [8] }],
        ["icrc1:name", { Text: "CatalyzeDAO" }],
        ["icrc1:symbol", { Text: "CAT" }],
        ["icrc1:fee", { Nat: [100000] }],
      ],
      icrc1_fee: [100000],
      icrc1_total_supply: 50000000000000000,
      swap_params: {
        params: {
          min_participant_icp_e8s: 100000000,
          neuron_basket_construction_parameters: {
            dissolve_delay_interval_seconds: 5259486,
            count: 7,
          },
          max_icp_e8s: 130000000000000,
          swap_due_timestamp_seconds: 1691785258,
          min_participants: 125,
          sns_token_e8s: 11250000000000000,
          sale_delay_seconds: null,
          max_participant_icp_e8s: 15000000000000,
          min_icp_e8s: 65000000000000,
        },
      },
      init: {
        init: {
          nns_proposal_id: null,
          sns_root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
          min_participant_icp_e8s: null,
          neuron_basket_construction_parameters: null,
          fallback_controller_principal_ids: [
            "ledm3-52ncq-rffuv-6ed44-hg5uo-iicyu-pwkzj-syfva-heo4k-p7itq-aqe",
            "efaeg-aiaaa-aaaap-aan6a-cai",
          ],
          max_icp_e8s: null,
          neuron_minimum_stake_e8s: 400000000,
          confirmation_text: null,
          swap_start_timestamp_seconds: null,
          swap_due_timestamp_seconds: null,
          min_participants: null,
          sns_token_e8s: null,
          nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
          transaction_fee_e8s: 100000,
          icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          sns_ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
          neurons_fund_participants: null,
          should_auto_finalize: null,
          max_participant_icp_e8s: null,
          sns_governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
          restricted_countries: { iso_codes: ["US"] },
          min_icp_e8s: null,
        },
      },
      derived_state: {
        sns_tokens_per_icp: 222.02796936035156,
        buyer_total_icp_e8s: 50669291278205,
        cf_participant_count: 145,
        direct_participant_count: 224,
        cf_neuron_count: 178,
      },
      lifecycle: {
        decentralization_sale_open_timestamp_seconds: 1690786778,
        lifecycle: 2,
      },
    };

    it("returns sns summary from aggregator data", () => {
      const {
        canister_ids: {
          root_canister_id,
          swap_canister_id,
          governance_canister_id,
          ledger_canister_id,
          index_canister_id,
        },
      } = mockData;

      expect(convertDtoToSnsSummary(mockData)).toEqual(
        new SnsSummaryWrapper({
          rootCanisterId: Principal.from(root_canister_id),
          swapCanisterId: Principal.from(swap_canister_id),
          governanceCanisterId: Principal.from(governance_canister_id),
          ledgerCanisterId: Principal.from(ledger_canister_id),
          indexCanisterId: Principal.from(index_canister_id),
          metadata: {
            description:
              "Catalyze is a one-stop social-fi application for organising your Web3 experience",
            logo: "https://5v72r-4aaaa-aaaaa-aabnq-cai.small12.testnet.dfinity.network/v1/sns/root/5psbn-niaaa-aaaaq-aaa4q-cai/logo.png",
            name: "Catalyze",
            url: "https://catalyze.one",
          },
          token: {
            fee: 100000n,
            name: "CatalyzeDAO",
            symbol: "CAT",
          },
          swap: {
            already_tried_to_auto_finalize: [],
            auto_finalize_swap_response: [],
            buyers: [],
            cf_participants: [],
            decentralization_sale_open_timestamp_seconds: 1690786778n,
            finalize_swap_in_progress: [],
            init: [
              {
                confirmation_text: [],
                fallback_controller_principal_ids: [
                  "ledm3-52ncq-rffuv-6ed44-hg5uo-iicyu-pwkzj-syfva-heo4k-p7itq-aqe",
                  "efaeg-aiaaa-aaaap-aan6a-cai",
                ],
                icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
                max_icp_e8s: [],
                max_participant_icp_e8s: [],
                min_icp_e8s: [],
                min_participant_icp_e8s: [],
                min_participants: [],
                neuron_basket_construction_parameters: [],
                neuron_minimum_stake_e8s: [400000000n],
                neurons_fund_participants: [],
                nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
                nns_proposal_id: [],
                restricted_countries: [
                  {
                    iso_codes: ["US"],
                  },
                ],
                should_auto_finalize: [],
                sns_governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
                sns_ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
                sns_root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
                sns_token_e8s: [],
                swap_due_timestamp_seconds: [],
                swap_start_timestamp_seconds: [],
                transaction_fee_e8s: [100000n],
                neurons_fund_participation_constraints: [],
                max_direct_participation_icp_e8s: [],
                min_direct_participation_icp_e8s: [],
                neurons_fund_participation: [],
              },
            ],
            lifecycle: 2,
            neuron_recipes: [],
            next_ticket_id: [],
            open_sns_token_swap_proposal_id: [123772n],
            params: {
              max_icp_e8s: 130000000000000n,
              max_participant_icp_e8s: 15000000000000n,
              min_icp_e8s: 65000000000000n,
              min_participant_icp_e8s: 100000000n,
              min_participants: 125,
              neuron_basket_construction_parameters: [
                {
                  count: 7n,
                  dissolve_delay_interval_seconds: 5259486n,
                },
              ],
              sale_delay_seconds: [],
              sns_token_e8s: 11250000000000000n,
              swap_due_timestamp_seconds: 1691785258n,
              max_direct_participation_icp_e8s: [],
              min_direct_participation_icp_e8s: [],
            },
            purge_old_tickets_last_completion_timestamp_nanoseconds: [],
            purge_old_tickets_next_principal: [],
            direct_participation_icp_e8s: [],
            neurons_fund_participation_icp_e8s: [],
          },
          derived: {
            buyer_total_icp_e8s: 50669291278205n,
            cf_neuron_count: [178n],
            cf_participant_count: [145n],
            direct_participant_count: [224n],
            sns_tokens_per_icp: 222.02796936035156,
            neurons_fund_participation_icp_e8s: [],
            direct_participation_icp_e8s: [],
          },
          init: {
            nns_proposal_id: [],
            sns_root_canister_id: "5psbn-niaaa-aaaaq-aaa4q-cai",
            min_participant_icp_e8s: [],
            neuron_basket_construction_parameters: [],
            fallback_controller_principal_ids: [
              "ledm3-52ncq-rffuv-6ed44-hg5uo-iicyu-pwkzj-syfva-heo4k-p7itq-aqe",
              "efaeg-aiaaa-aaaap-aan6a-cai",
            ],
            max_icp_e8s: [],
            neuron_minimum_stake_e8s: [400000000n],
            confirmation_text: [],
            swap_start_timestamp_seconds: [],
            swap_due_timestamp_seconds: [],
            min_participants: [],
            sns_token_e8s: [],
            nns_governance_canister_id: "rrkah-fqaaa-aaaaa-aaaaq-cai",
            transaction_fee_e8s: [100000n],
            icp_ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
            sns_ledger_canister_id: "5bqmf-wyaaa-aaaaq-aaa5q-cai",
            neurons_fund_participants: [],
            should_auto_finalize: [],
            max_participant_icp_e8s: [],
            sns_governance_canister_id: "5grkr-3aaaa-aaaaq-aaa5a-cai",
            restricted_countries: [{ iso_codes: ["US"] }],
            min_icp_e8s: [],
            neurons_fund_participation_constraints: [],
            max_direct_participation_icp_e8s: [],
            min_direct_participation_icp_e8s: [],
            neurons_fund_participation: [],
          },
          swapParams: {
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
            max_direct_participation_icp_e8s: [],
            min_direct_participation_icp_e8s: [],
          },
          lifecycle: {
            decentralization_sale_open_timestamp_seconds: [1690786778n],
            lifecycle: [2],
          },
        })
      );
    });

    it("returns undefined if a metadata required field is missing", () => {
      const aggregatorMissingMetadata = {
        ...mockData,
        meta: {
          ...mockData.meta,
          name: null,
        },
      };
      expect(convertDtoToSnsSummary(aggregatorMissingMetadata)).toBeUndefined();
    });

    it("returns undefined if a token metadata required field is missing", () => {
      const aggregatorMissingMetadata = {
        ...mockData,
        icrc1_metadata: mockData.icrc1_metadata.filter(
          ([key]) => key !== "icrc1:symbol"
        ),
      };
      expect(convertDtoToSnsSummary(aggregatorMissingMetadata)).toBeUndefined();
    });

    it("returns undefined if a swap params required field is missing", () => {
      const aggregatorMissingSwapParams: CachedSnsDto = {
        ...mockData,
        swap_state: {
          ...mockData.swap_state,
          swap: {
            ...mockData.swap_state.swap,
            params: null,
          },
        },
      };
      expect(
        convertDtoToSnsSummary(aggregatorMissingSwapParams)
      ).toBeUndefined();
    });

    it("converts fields related to NF participation enhancements", () => {
      const aggregatorNFAndDirectParticipationFields: CachedSnsDto = {
        ...mockData,
        swap_state: {
          ...mockData.swap_state,
          swap: {
            ...mockData.swap_state.swap,
            direct_participation_icp_e8s: 300000000000000,
            neurons_fund_participation_icp_e8s: 100000000000000,
            params: {
              ...mockData.swap_state.swap.params,
              min_direct_participation_icp_e8s: 300000000000,
              max_direct_participation_icp_e8s: 3000000000000,
            },
            init: {
              ...mockData.swap_state.swap.init,
              neurons_fund_participation_constraints: {
                coefficient_intervals: [
                  {
                    slope_numerator: 2,
                    intercept_icp_e8s: 5000000000,
                    from_direct_participation_icp_e8s: 1000000000,
                    slope_denominator: 3,
                    to_direct_participation_icp_e8s: 2000000000,
                  },
                ],
                max_neurons_fund_participation_icp_e8s: 300000000000,
                min_direct_participation_threshold_icp_e8s: 10000000000,
              },
              min_direct_participation_icp_e8s: 300000000000,
              max_direct_participation_icp_e8s: 3000000000000,
              neurons_fund_participation: true,
            },
          },
          derived: {
            ...mockData.swap_state.derived,
            direct_participation_icp_e8s: 300000000000000,
            neurons_fund_participation_icp_e8s: 100000000000000,
          },
        },
        derived_state: {
          ...mockData.derived_state,
          direct_participation_icp_e8s: 300000000000000,
          neurons_fund_participation_icp_e8s: 100000000000000,
        },
        init: {
          init: {
            ...mockData.init.init,
            min_direct_participation_icp_e8s: 300000000000,
            max_direct_participation_icp_e8s: 3000000000000,
            neurons_fund_participation: true,
          },
        },
      };

      const summaryMockData = convertDtoToSnsSummary(mockData);
      expect(
        convertDtoToSnsSummary(aggregatorNFAndDirectParticipationFields)
      ).toEqual(
        new SnsSummaryWrapper({
          rootCanisterId: summaryMockData.rootCanisterId,
          swapCanisterId: summaryMockData.swapCanisterId,
          governanceCanisterId: summaryMockData.governanceCanisterId,
          ledgerCanisterId: summaryMockData.ledgerCanisterId,
          indexCanisterId: summaryMockData.indexCanisterId,
          metadata: summaryMockData.metadata,
          token: summaryMockData.token,
          swapParams: summaryMockData.swapParams,
          lifecycle: summaryMockData.lifecycle,
          swap: {
            ...summaryMockData.swap,
            params: {
              ...summaryMockData.swap.params,
              min_direct_participation_icp_e8s: [300000000000n],
              max_direct_participation_icp_e8s: [3000000000000n],
            },
            init: [
              {
                ...summaryMockData.swap.init[0],
                neurons_fund_participation_constraints: [
                  {
                    coefficient_intervals: [
                      {
                        slope_numerator: [2n],
                        intercept_icp_e8s: [5000000000n],
                        from_direct_participation_icp_e8s: [1000000000n],
                        slope_denominator: [3n],
                        to_direct_participation_icp_e8s: [2000000000n],
                      },
                    ],
                    max_neurons_fund_participation_icp_e8s: [300000000000n],
                    min_direct_participation_threshold_icp_e8s: [10000000000n],
                  },
                ],
                min_direct_participation_icp_e8s: [300000000000n],
                max_direct_participation_icp_e8s: [3000000000000n],
                neurons_fund_participation: [true],
              },
            ],
            direct_participation_icp_e8s: [300000000000000n],
            neurons_fund_participation_icp_e8s: [100000000000000n],
          },
          derived: {
            ...summaryMockData.derived,
            direct_participation_icp_e8s: [300000000000000n],
            neurons_fund_participation_icp_e8s: [100000000000000n],
          },
          init: {
            ...summaryMockData.init,
            min_direct_participation_icp_e8s: [300000000000n],
            max_direct_participation_icp_e8s: [3000000000000n],
            neurons_fund_participation: [true],
          },
        })
      );
    });

    it("returns an instance of SnsSummaryWrapper", () => {
      expect(convertDtoToSnsSummary(mockData)).toBeInstanceOf(
        SnsSummaryWrapper
      );
    });
  });

  describe("convertNervousFunction", () => {
    it("converts nervous function to ic-js type", () => {
      const nsFunction = {
        id: 0,
        name: "All Topics",
        description: "Catch-all w.r.t to following for all types of proposals.",
        function_type: { NativeNervousSystemFunction: {} },
      };

      expect(convertNervousFunction(nsFunction)).toEqual({
        id: 0n,
        name: "All Topics",
        description: [
          "Catch-all w.r.t to following for all types of proposals.",
        ],
        function_type: [{ NativeNervousSystemFunction: {} }],
      });
    });

    it("returns function_type as empty array when null", () => {
      const nsFunction = {
        id: 0,
        name: "All Topics",
        description: "Catch-all w.r.t to following for all types of proposals.",
        function_type: null,
      };

      expect(convertNervousFunction(nsFunction)).toEqual({
        id: 0n,
        name: "All Topics",
        description: [
          "Catch-all w.r.t to following for all types of proposals.",
        ],
        function_type: [],
      });
    });
  });
});
