import {
  convertDtoData,
  convertDtoToSnsSummary,
} from "$lib/utils/sns-aggregator-converters.utils";
import {
  aggregatorSnsMock,
  aggregatorSnsMockDto,
} from "$tests/mocks/sns-aggregator.mock";
import { Principal } from "@dfinity/principal";

describe("sns aggregator converters utils", () => {
  describe("convertDtoData", () => {
    it("converts aggregator types to ic-js types", () => {
      expect(convertDtoData([aggregatorSnsMockDto])).toEqual([
        aggregatorSnsMock,
      ]);
    });
  });

  describe("convertDtoToSnsSummary", () => {
    it("returns sns summary from aggregator data", () => {
      const {
        canister_ids: {
          root_canister_id,
          swap_canister_id,
          governance_canister_id,
          ledger_canister_id,
          index_canister_id,
        },
      } = aggregatorSnsMockDto;

      expect(convertDtoToSnsSummary(aggregatorSnsMockDto)).toEqual({
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
          },
          purge_old_tickets_last_completion_timestamp_nanoseconds: [],
          purge_old_tickets_next_principal: [],
        },
        derived: {
          buyer_total_icp_e8s: 50669291278205n,
          cf_neuron_count: [178n],
          cf_participant_count: [145n],
          direct_participant_count: [224n],
          sns_tokens_per_icp: 222.02796936035156,
        },
      });
    });

    it("returns undefined if a metadata required field is missing", () => {
      const aggregatorMissingMetadata = {
        ...aggregatorSnsMockDto,
        meta: {
          ...aggregatorSnsMockDto.meta,
          name: null,
        },
      };
      expect(convertDtoToSnsSummary(aggregatorMissingMetadata)).toBeUndefined();
    });

    it("returns undefined if a token metadata required field is missing", () => {
      const aggregatorMissingMetadata = {
        ...aggregatorSnsMockDto,
        icrc1_metadata: aggregatorSnsMockDto.icrc1_metadata.filter(
          ([key]) => key !== "icrc1:symbol"
        ),
      };
      expect(convertDtoToSnsSummary(aggregatorMissingMetadata)).toBeUndefined();
    });
  });
});
