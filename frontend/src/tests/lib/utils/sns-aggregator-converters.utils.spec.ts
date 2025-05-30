import {
  isUnknownTopic,
  type CachedNervousFunctionDto,
  type CachedNervousSystemParametersDto,
  type CachedNeuronIdDto,
  type CachedSnsDto,
  type CachedSnsTokenMetadataDto,
  type ListTopicsResponseWithUnknown,
  type TopicInfoDto,
  type TopicInfoWithUnknown,
  type UnknownTopic,
} from "$lib/types/sns-aggregator";
import { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import {
  convertDtoToListTopicsResponse,
  convertDtoToSnsSummary,
  convertDtoTopicInfo,
  convertIcrc1Metadata,
  convertNervousFunction,
  convertNervousSystemParameters,
} from "$lib/utils/sns-aggregator-converters.utils";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { Principal } from "@dfinity/principal";
import type { SnsNervousSystemParameters, SnsTopicInfo } from "@dfinity/sns";

describe("sns aggregator converters utils", () => {
  describe("convertDtoData", () => {
    it("converts aggregator icrc metadata to ic-js types", () => {
      const metadata: CachedSnsTokenMetadataDto = [
        ["icrc1:decimals", { Nat: [8] }],
        ["icrc1:name", { Text: "CatalyzeDAO" }],
        ["icrc1:symbol", { Text: "CAT" }],
        ["icrc1:fee", { Nat: [100000] }],
      ];
      expect(convertIcrc1Metadata(metadata)).toEqual([
        ["icrc1:decimals", { Nat: 8n }],
        ["icrc1:name", { Text: "CatalyzeDAO" }],
        ["icrc1:symbol", { Text: "CAT" }],
        ["icrc1:fee", { Nat: 100000n }],
      ]);
    });

    it("converts icrc1:fee using not only lower parts of a 64-bit value", () => {
      const metadata: CachedSnsTokenMetadataDto = [
        ["icrc1:decimals", { Nat: [8] }],
        ["icrc1:name", { Text: "CatalyzeDAO" }],
        ["icrc1:symbol", { Text: "CAT" }],
        ["icrc1:fee", { Nat: [705032704, 1] }],
      ];
      expect(convertIcrc1Metadata(metadata)).toEqual([
        ["icrc1:decimals", { Nat: 8n }],
        ["icrc1:name", { Text: "CatalyzeDAO" }],
        ["icrc1:symbol", { Text: "CAT" }],
        ["icrc1:fee", { Nat: 5_000_000_000n }],
      ]);
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
      nervous_system_parameters: {
        default_followees: {
          followees: [],
        },
        max_dissolve_delay_seconds: 252460800,
        max_dissolve_delay_bonus_percentage: 100,
        max_followees_per_function: 15,
        neuron_claimer_permissions: {
          permissions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        },
        neuron_minimum_stake_e8s: 100000000000,
        max_neuron_age_for_age_bonus: 252460800,
        initial_voting_period_seconds: 345600,
        neuron_minimum_dissolve_delay_to_vote_seconds: 2629800,
        reject_cost_e8s: 5000000000000,
        max_proposals_to_keep_per_action: 100,
        wait_for_quiet_deadline_increase_seconds: 86400,
        max_number_of_neurons: 200000,
        transaction_fee_e8s: 100000,
        max_number_of_proposals_with_ballots: 700,
        max_age_bonus_percentage: 25,
        neuron_grantable_permissions: {
          permissions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        },
        voting_rewards_parameters: {
          final_reward_rate_basis_points: 0,
          initial_reward_rate_basis_points: 0,
          reward_rate_transition_duration_seconds: 31557600,
          round_duration_seconds: 86400,
        },
        maturity_modulation_disabled: null,
        max_number_of_principals_per_neuron: 5,
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
      topics: {
        topics: [],
        uncategorized_functions: [],
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
            decimals: 8,
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
            decentralization_swap_termination_timestamp_seconds: [],
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

    it("returns undefined if a lifecycle required field is missing", () => {
      const aggregatorMissingLifecycle: CachedSnsDto = {
        ...mockData,
        lifecycle: null,
      };
      expect(
        convertDtoToSnsSummary(aggregatorMissingLifecycle)
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
                    ideal_matched_participation_function: [],
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
  });

  describe("convertNervousFunction", () => {
    const baseNsFunction = {
      id: 0,
      name: "All Topics",
      description: "Catch-all w.r.t to following for all types of proposals.",
    };

    it("converts native nervous function to ic-js type", () => {
      const nsFunction = {
        ...baseNsFunction,
        function_type: {
          NativeNervousSystemFunction: {},
        },
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

    it("converts generic nervous function to ic-js type", () => {
      const canisterIdString = "aaaaa-aa";
      const canisterId = Principal.fromText(canisterIdString);
      const method = "method";
      const targetMethod = "target_method_name";

      const nsFunction = {
        ...baseNsFunction,
        function_type: {
          GenericNervousSystemFunction: {
            validator_canister_id: canisterIdString,
            target_canister_id: canisterIdString,
            validator_method_name: method,
            target_method_name: targetMethod,
            topic: {
              DappCanisterManagement: null,
            },
          },
        },
      };

      expect(convertNervousFunction(nsFunction)).toEqual({
        id: 0n,
        name: "All Topics",
        description: [
          "Catch-all w.r.t to following for all types of proposals.",
        ],
        function_type: [
          {
            GenericNervousSystemFunction: {
              validator_canister_id: [canisterId],
              target_canister_id: [canisterId],
              validator_method_name: [method],
              target_method_name: [targetMethod],
              topic: [
                {
                  DappCanisterManagement: null,
                },
              ],
            },
          },
        ],
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

  describe("convertNervousSystemParameters", () => {
    it("converts nervous system parameters to ic-js type", () => {
      const neuronId1: CachedNeuronIdDto = { id: Uint8Array.from([1, 2, 3]) };
      const neuronId2: CachedNeuronIdDto = { id: Uint8Array.from([4, 5, 6]) };
      const neuronId3: CachedNeuronIdDto = { id: Uint8Array.from([7, 8, 9]) };
      const nervousSystemParameterData: CachedNervousSystemParametersDto = {
        default_followees: {
          followees: [
            [2, { followees: [neuronId1, neuronId2] }],
            [5, { followees: [neuronId2, neuronId3] }],
          ],
        },
        max_dissolve_delay_seconds: 252460800,
        max_dissolve_delay_bonus_percentage: 100,
        max_followees_per_function: 15,
        neuron_claimer_permissions: {
          permissions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        },
        neuron_minimum_stake_e8s: 100000000000,
        max_neuron_age_for_age_bonus: 252460800,
        initial_voting_period_seconds: 345600,
        neuron_minimum_dissolve_delay_to_vote_seconds: 2629800,
        reject_cost_e8s: 5000000000000,
        max_proposals_to_keep_per_action: 150,
        wait_for_quiet_deadline_increase_seconds: 86400,
        max_number_of_neurons: 200000,
        transaction_fee_e8s: 100000,
        max_number_of_proposals_with_ballots: 700,
        max_age_bonus_percentage: 25,
        neuron_grantable_permissions: {
          permissions: [0, 1, 2, 3, 4],
        },
        voting_rewards_parameters: {
          final_reward_rate_basis_points: 75,
          initial_reward_rate_basis_points: 20,
          reward_rate_transition_duration_seconds: 31557600,
          round_duration_seconds: 86400,
        },
        maturity_modulation_disabled: true,
        max_number_of_principals_per_neuron: 5,
      };

      const expectedSnsNervousSystemParameters: SnsNervousSystemParameters = {
        default_followees: [
          {
            followees: [
              [2n, { followees: [neuronId1, neuronId2] }],
              [5n, { followees: [neuronId2, neuronId3] }],
            ],
          },
        ],
        automatically_advance_target_version: [],
        max_dissolve_delay_seconds: [252460800n],
        max_dissolve_delay_bonus_percentage: [100n],
        max_followees_per_function: [15n],
        neuron_claimer_permissions: [
          {
            permissions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          },
        ],
        neuron_minimum_stake_e8s: [100000000000n],
        max_neuron_age_for_age_bonus: [252460800n],
        initial_voting_period_seconds: [345600n],
        neuron_minimum_dissolve_delay_to_vote_seconds: [2629800n],
        reject_cost_e8s: [5000000000000n],
        max_proposals_to_keep_per_action: [150],
        wait_for_quiet_deadline_increase_seconds: [86400n],
        max_number_of_neurons: [200000n],
        transaction_fee_e8s: [100000n],
        max_number_of_proposals_with_ballots: [700n],
        max_age_bonus_percentage: [25n],
        neuron_grantable_permissions: [{ permissions: [0, 1, 2, 3, 4] }],
        voting_rewards_parameters: [
          {
            final_reward_rate_basis_points: [75n],
            initial_reward_rate_basis_points: [20n],
            reward_rate_transition_duration_seconds: [31557600n],
            round_duration_seconds: [86400n],
          },
        ],
        maturity_modulation_disabled: [true],
        max_number_of_principals_per_neuron: [5n],
      };

      expect(
        convertNervousSystemParameters(nervousSystemParameterData)
      ).toEqual(expectedSnsNervousSystemParameters);
    });

    it("converts nervous system parameters with empty optionals to ic-js type", () => {
      const nervousSystemParameterData: CachedNervousSystemParametersDto = {
        default_followees: null,
        max_dissolve_delay_seconds: null,
        max_dissolve_delay_bonus_percentage: null,
        max_followees_per_function: null,
        neuron_claimer_permissions: null,
        neuron_minimum_stake_e8s: null,
        max_neuron_age_for_age_bonus: null,
        initial_voting_period_seconds: null,
        neuron_minimum_dissolve_delay_to_vote_seconds: null,
        reject_cost_e8s: null,
        max_proposals_to_keep_per_action: null,
        wait_for_quiet_deadline_increase_seconds: null,
        max_number_of_neurons: null,
        transaction_fee_e8s: null,
        max_number_of_proposals_with_ballots: null,
        max_age_bonus_percentage: null,
        neuron_grantable_permissions: null,
        voting_rewards_parameters: null,
        maturity_modulation_disabled: null,
        max_number_of_principals_per_neuron: null,
      };

      const expectedSnsNervousSystemParameters: SnsNervousSystemParameters = {
        automatically_advance_target_version: [],
        default_followees: [],
        max_dissolve_delay_seconds: [],
        max_dissolve_delay_bonus_percentage: [],
        max_followees_per_function: [],
        neuron_claimer_permissions: [],
        neuron_minimum_stake_e8s: [],
        max_neuron_age_for_age_bonus: [],
        initial_voting_period_seconds: [],
        neuron_minimum_dissolve_delay_to_vote_seconds: [],
        reject_cost_e8s: [],
        max_proposals_to_keep_per_action: [],
        wait_for_quiet_deadline_increase_seconds: [],
        max_number_of_neurons: [],
        transaction_fee_e8s: [],
        max_number_of_proposals_with_ballots: [],
        max_age_bonus_percentage: [],
        neuron_grantable_permissions: [],
        voting_rewards_parameters: [],
        maturity_modulation_disabled: [],
        max_number_of_principals_per_neuron: [],
      };

      expect(
        convertNervousSystemParameters(nervousSystemParameterData)
      ).toEqual(expectedSnsNervousSystemParameters);
    });
  });

  describe("topics conversion", () => {
    const canisterIdString = "aaaaa-aa";
    const canisterId = Principal.fromText(canisterIdString);
    const method = "method";
    const targetMethod = "target_method_name";
    const customFunction: CachedNervousFunctionDto = {
      id: 1001,
      name: "Custom Function",
      description: "Description 3",
      function_type: {
        GenericNervousSystemFunction: {
          validator_canister_id: canisterIdString,
          target_canister_id: canisterIdString,
          validator_method_name: method,
          target_method_name: targetMethod,
          topic: {
            DappCanisterManagement: null,
          },
        },
      },
    };
    const topicInfo: TopicInfoDto = {
      native_functions: [
        {
          id: 13,
          name: "Native Function",
          description: "Description 1",
          function_type: {
            NativeNervousSystemFunction: {},
          },
        },
      ],
      topic: "DaoCommunitySettings",
      is_critical: false,
      name: "DAO community settings",
      description: "Description 2",
      custom_functions: [
        {
          id: 1001,
          name: "Custom Function",
          description: "Description 3",
          function_type: {
            GenericNervousSystemFunction: {
              validator_canister_id: canisterIdString,
              target_canister_id: canisterIdString,
              validator_method_name: method,
              target_method_name: targetMethod,
              topic: {
                DappCanisterManagement: null,
              },
            },
          },
        },
      ],
    };
    const unknownTopicInfo: TopicInfoDto = {
      native_functions: [],
      topic: "Unknown Topic",
      is_critical: true,
      name: "Unknown topic name",
      description: "Unknown topic description",
      custom_functions: [],
    };

    describe("isUnknownTopic", () => {
      it("returns true if topic is unknown", () => {
        const topic: UnknownTopic = { UnknownTopic: null };
        expect(isUnknownTopic(topic)).toBe(true);
      });

      it("returns false if topic is known", () => {
        expect(
          isUnknownTopic({
            DappCanisterManagement: null,
          })
        ).toBe(false);
      });
    });

    describe("convertDtoTopicInfo", () => {
      it("converts aggregator topic info to ic-js types", () => {
        const expectedTopicInfo: SnsTopicInfo = {
          native_functions: [
            [
              {
                id: 13n,
                name: "Native Function",
                description: ["Description 1"],
                function_type: [{ NativeNervousSystemFunction: {} }],
              },
            ],
          ],
          topic: [
            {
              DaoCommunitySettings: null,
            },
          ],
          is_critical: [false],
          name: ["DAO community settings"],
          description: ["Description 2"],
          custom_functions: [
            [
              {
                id: 1001n,
                name: "Custom Function",
                description: ["Description 3"],
                function_type: [
                  {
                    GenericNervousSystemFunction: {
                      validator_canister_id: [canisterId],
                      target_canister_id: [canisterId],
                      validator_method_name: [method],
                      target_method_name: [targetMethod],
                      topic: [
                        {
                          DappCanisterManagement: null,
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          ],
        };
        expect(convertDtoTopicInfo(topicInfo)).toEqual(expectedTopicInfo);
      });

      it("supports unknown topics", () => {
        const spyOnConsoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => undefined);
        const expectedUnknownTopicInfo: TopicInfoWithUnknown = {
          native_functions: [[]],
          topic: [
            {
              UnknownTopic: null,
            },
          ],
          is_critical: [true],
          name: ["Unknown topic name"],
          description: ["Unknown topic description"],
          custom_functions: [[]],
        };
        expect(convertDtoTopicInfo(unknownTopicInfo)).toEqual(
          expectedUnknownTopicInfo
        );
        expect(spyOnConsoleError).toHaveBeenCalledTimes(1);
      });
    });

    describe("convertDtoToListTopicsResponse", () => {
      it("converts list topics response to ic-js type", () => {
        const spyOnConsoleError = vi
          .spyOn(console, "error")
          .mockImplementation(() => undefined);
        const expectedTopicsResponse: ListTopicsResponseWithUnknown = {
          topics: [
            [
              {
                native_functions: [
                  [
                    {
                      id: 13n,
                      name: "Native Function",
                      description: ["Description 1"],
                      function_type: [{ NativeNervousSystemFunction: {} }],
                    },
                  ],
                ],
                topic: [
                  {
                    DaoCommunitySettings: null,
                  },
                ],
                is_critical: [false],
                name: ["DAO community settings"],
                description: ["Description 2"],
                custom_functions: [
                  [
                    {
                      id: 1001n,
                      name: "Custom Function",
                      description: ["Description 3"],
                      function_type: [
                        {
                          GenericNervousSystemFunction: {
                            validator_canister_id: [canisterId],
                            target_canister_id: [canisterId],
                            validator_method_name: [method],
                            target_method_name: [targetMethod],
                            topic: [
                              {
                                DappCanisterManagement: null,
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                ],
              },
              // Unknown TopicInfo
              {
                native_functions: [[]],
                topic: [
                  {
                    UnknownTopic: null,
                  },
                ],
                is_critical: [true],
                name: ["Unknown topic name"],
                description: ["Unknown topic description"],
                custom_functions: [[]],
              },
            ],
          ],
          uncategorized_functions: [
            [
              {
                id: 1001n,
                name: "Custom Function",
                description: ["Description 3"],
                function_type: [
                  {
                    GenericNervousSystemFunction: {
                      validator_canister_id: [canisterId],
                      target_canister_id: [canisterId],
                      validator_method_name: [method],
                      target_method_name: [targetMethod],
                      topic: [
                        {
                          DappCanisterManagement: null,
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          ],
        };
        expect(
          convertDtoToListTopicsResponse({
            topics: [topicInfo, unknownTopicInfo],
            uncategorized_functions: [customFunction],
          })
        ).toEqual(expectedTopicsResponse);
        expect(spyOnConsoleError).toHaveBeenCalledTimes(1);
      });
    });
  });
});
