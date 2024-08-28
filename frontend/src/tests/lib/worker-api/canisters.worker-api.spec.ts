import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import { queryCanisterDetails } from "$lib/worker-api/canisters.worker-api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterDetails } from "$tests/mocks/canisters.mock";
import type { CanisterStatusResponse } from "@dfinity/ic-management";
import { ICManagementCanister } from "@dfinity/ic-management";
import { mock } from "vitest-mock-extended";

// Mock createAgent to avoid console errors caused by the time-syncing fetch call in agent-js.
vi.mock("@dfinity/utils", async () => {
  return {
    ...(await vi.importActual<any>("@dfinity/utils")),
    __esModule: true,
    createAgent: vi.fn(),
  };
});

describe("canisters-worker-api", () => {
  const response: CanisterStatusResponse = {
    status: { running: null },
    memory_size: 1_000n,
    cycles: 10_000n,
    settings: {
      controllers: [],
      reserved_cycles_limit: 1_000_000_000n,
      freezing_threshold: 0n,
      memory_allocation: 10n,
      compute_allocation: 5n,
      log_visibility: { controllers: null },
      wasm_memory_limit: 1_000_000_000n,
    },
    module_hash: [],
    idle_cycles_burned_per_day: 300n,
    reserved_cycles: 1_000_000n,
    query_stats: {
      num_calls_total: 1n,
      num_instructions_total: 2n,
      request_payload_bytes_total: 3n,
      response_payload_bytes_total: 4n,
    },
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
        memorySize: 1_000n,
        cycles: 10_000n,
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
