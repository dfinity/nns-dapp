import { governanceMetricsStore } from "$lib/stores/governance-metrics.store";
import { mockGovernanceMetrics } from "$tests/mocks/governance-metrics.mock";
import { get } from "svelte/store";

describe("governance-metrics-store", () => {
  it("should set parameters", () => {
    expect(get(governanceMetricsStore)).toEqual({
      parameters: undefined,
      certified: undefined,
    });

    governanceMetricsStore.setMetrics({
      metrics: mockGovernanceMetrics,
      certified: true,
    });

    expect(get(governanceMetricsStore)).toEqual({
      metrics: mockGovernanceMetrics,
      certified: true,
    });
  });
});
