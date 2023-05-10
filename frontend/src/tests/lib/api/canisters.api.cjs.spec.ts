import { queryCanisterDetails } from "$lib/api/canisters.api.cjs";
import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import type { CanisterStatusResponse } from "$lib/canisters/ic-management/ic-management.types";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterDetails } from "$tests/mocks/canisters.mock";
import { vi } from "vitest";

vi.mock("@dfinity/agent/lib/cjs/index", () => {
  class MockHttpAgent {}

  const response: CanisterStatusResponse = {
    status: { running: null },
    memory_size: BigInt(1000),
    cycles: BigInt(10_000),
    settings: {
      controllers: [],
      freezing_threshold: 0n,
      memory_allocation: 10n,
      compute_allocation: 5n,
    },
    module_hash: [],
  };

  return {
    HttpAgent: MockHttpAgent,
    getManagementCanister: () => ({
      canister_status: async () => response,
    }),
  };
});

describe("canisters-api.cjs", () => {
  afterAll(() => vi.resetAllMocks());

  describe("queryCanisterDetails", () => {
    it("should call IC Management Canister with canister id", async () => {
      const result = await queryCanisterDetails({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id.toText(),
      });

      expect(result).toEqual({
        id: mockCanisterDetails.id,
        status: CanisterStatus.Running,
        memorySize: 1000n,
        cycles: 10000n,
        settings: {
          controllers: [],
          freezingThreshold: 0n,
          memoryAllocation: 10n,
          computeAllocation: 5n,
        },
        moduleHash: undefined,
      });
    });
  });
});
