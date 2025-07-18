import { snsMetricsStore } from "$lib/derived/sns-metrics.derived";
import { mockSnsMetrics, principal } from "$tests/mocks/sns-projects.mock";
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
    setSnsProjects([
      {
        rootCanisterId,
        metrics: mockSnsMetrics,
      },
    ]);

    expect(get(snsMetricsStore)[rootCanisterId.toText()]).toEqual(
      mockSnsMetrics
    );
  });
});
