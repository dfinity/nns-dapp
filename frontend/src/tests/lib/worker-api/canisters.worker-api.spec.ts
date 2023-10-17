import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import { queryCanisterDetails } from "$lib/worker-api/canisters.worker-api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterDetails } from "$tests/mocks/canisters.mock";
import type { CanisterStatusResponse } from "@dfinity/ic-management";
import { ICManagementCanister } from "@dfinity/ic-management";
import { mock } from "vitest-mock-extended";

vi.mock("@dfinity/agent");

describe("canisters-worker-api", () => {
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
    idle_cycles_burned_per_day: 300n,
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const mockICManagementCanister = mock<ICManagementCanister>();
    vi.spyOn(ICManagementCanister, "create").mockImplementation(
      () => mockICManagementCanister
    );

    mockICManagementCanister.canisterStatus.mockResolvedValue(response);
  });

  describe("queryCanisterDetails", () => {
    it("should call IC Management Canister with canister id", async () => {
      const host = "http://localhost:8000";
      const result = await queryCanisterDetails({
        identity: mockIdentity,
        canisterId: mockCanisterDetails.id.toText(),
        host,
        fetchRootKey: false,
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
        idleCyclesBurnedPerDay: 300n,
      });
    });
  });
});
