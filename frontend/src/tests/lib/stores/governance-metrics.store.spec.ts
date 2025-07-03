import { governanceMetricsStore } from "$lib/stores/governance-metrics.store";
import { mockGovernanceMetrics } from "$tests/mocks/governance-metrics.mock";
import { get } from "svelte/store";

describe("governance-metrics-store", () => {
  it("should set parameters", () => {
    expect(get(governanceMetricsStore)).toEqual({
      parameters: undefined,
      certified: undefined,
    });

    governanceMetricsStore.setParameters({
      parameters: mockGovernanceMetrics,
      certified: true,
    });

    expect(get(governanceMetricsStore)).toEqual({
      parameters: mockGovernanceMetrics,
      certified: true,
    });
  });
});
