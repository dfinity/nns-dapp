import * as api from "$lib/api/governance.api";
import * as authServices from "$lib/services/auth.services";
import { loadGovernanceMetrics } from "$lib/services/governance-metrics.service";
import { governanceMetricsStore } from "$lib/stores/governance-metrics.store";
import {
  mockGetIdentity,
  mockIdentity,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockGovernanceMetrics } from "$tests/mocks/governance-metrics.mock";
import { get } from "svelte/store";

describe("governance-metrics-services", () => {
  let spyGetGovernanceMetrics;

  beforeEach(() => {
    resetIdentity();
    spyGetGovernanceMetrics = vi
      .spyOn(api, "getGovernanceMetrics")
      .mockResolvedValue(mockGovernanceMetrics);

    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
  });

  describe("loadGovernanceMetrics", () => {
    it("should load governance metrics", async () => {
      await loadGovernanceMetrics();

      expect(spyGetGovernanceMetrics).toHaveBeenCalledTimes(2);
      expect(spyGetGovernanceMetrics).toHaveBeenNthCalledWith(1, {
        identity: mockIdentity,
        certified: false,
      });
      expect(spyGetGovernanceMetrics).toHaveBeenNthCalledWith(2, {
        identity: mockIdentity,
        certified: true,
      });
    });

    it("should update governance metrics store", async () => {
      expect(get(governanceMetricsStore)).toEqual({
        metrics: undefined,
        certified: undefined,
      });

      await loadGovernanceMetrics();

      expect(get(governanceMetricsStore)).toEqual({
        metrics: mockGovernanceMetrics,
        certified: true,
      });
    });

    it("should console log on error", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const error = new Error("test error");
      spyGetGovernanceMetrics = vi
        .spyOn(api, "getGovernanceMetrics")
        .mockRejectedValue(error);

      await loadGovernanceMetrics();

      expect(console.error).toBeCalledWith(error);
      expect(console.error).toBeCalledTimes(2);
    });
  });
});
