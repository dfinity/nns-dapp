import { snsMetricsStore } from "$lib/derived/sns-metrics.derived";
import type { MetricsDto } from "$lib/types/sns-aggregator";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("snsMetricsStore", () => {
  const rootCanisterId = principal(0);

  it("should handle missing data", () => {
    setSnsProjects([
      {
        rootCanisterId,
      },
    ]);

    expect(get(snsMetricsStore)[rootCanisterId.toText()]).toEqual(undefined);
  });

  it("should return data by rootCanisterId", () => {
    const metrics: MetricsDto = {
      treasury_metrics: [
        {
          name: "TOKEN_ICP",
          original_amount_e8s: 314100000000,
          amount_e8s: 314099990000,
          account: {
            owner: "7uieb-cx777-77776-qaaaq-cai",
            subaccount: null,
          },
          ledger_canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
          treasury: 1,
          timestamp_seconds: 1752222478,
        },
        {
          name: "TOKEN_SNS_TOKEN",
          original_amount_e8s: 0,
          amount_e8s: 293700000000,
          account: {
            owner: "7uieb-cx777-77776-qaaaq-cai",
            subaccount: {
              subaccount: [
                246, 230, 97, 166, 146, 227, 55, 186, 137, 156, 240, 185, 163,
                97, 8, 105, 207, 138, 114, 142, 181, 152, 159, 206, 247, 187,
                126, 235, 138, 0, 64, 161,
              ],
            },
          },
          ledger_canister_id: "75lp5-u7777-77776-qaaba-cai",
          treasury: 2,
          timestamp_seconds: 1752222478,
        },
      ],
      voting_power_metrics: {
        governance_total_potential_voting_power: 501746342465693,
        timestamp_seconds: 1752222478,
      },
      last_ledger_block_timestamp: 1752141149,
      num_recently_executed_proposals: 0,
      num_recently_submitted_proposals: 0,
      genesis_timestamp_seconds: 1752074520,
    };

    setSnsProjects([
      {
        rootCanisterId,
        metrics,
      },
    ]);

    expect(get(snsMetricsStore)[rootCanisterId.toText()]).toEqual(metrics);
  });
});
