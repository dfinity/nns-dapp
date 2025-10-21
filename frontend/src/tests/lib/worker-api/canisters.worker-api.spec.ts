import { CanisterStatus } from "$lib/canisters/ic-management/ic-management.canister.types";
import { queryCanisterDetails } from "$lib/worker-api/canisters.worker-api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterDetails } from "$tests/mocks/canisters.mock";
import * as dfinityUtils from "@dfinity/utils";
import type { CanisterStatusResponse } from "@icp-sdk/canisters/ic-management";
import { ICManagementCanister } from "@icp-sdk/canisters/ic-management";
import { mock } from "vitest-mock-extended";

describe("canisters-worker-api", () => {
  const response: CanisterStatusResponse = {
    memory_metrics: {
      wasm_binary_size: 2_000_900n,
      wasm_chunk_store_size: 2_100_800n,
      canister_history_size: 2_200_700n,
      stable_memory_size: 2_300_600n,
      snapshots_size: 2_400_500n,
      wasm_memory_size: 2_500_400n,
      global_memory_size: 2_600_300n,
      custom_sections_size: 2_700_200n,
    },
    status: { running: null },
    memory_size: 1_000n,
    cycles: 10_000n,
    settings: {
      wasm_memory_threshold: 1_000_000_000n,
      controllers: [],
      reserved_cycles_limit: 1_000_000_000n,
      freezing_threshold: 0n,
      memory_allocation: 10n,
      compute_allocation: 5n,
      log_visibility: { controllers: null },
      wasm_memory_limit: 1_000_000_000n,
      environment_variables: [],
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
    ready_for_migration: true,
    version: 42n,
  };

  beforeEach(async () => {
    const mockICManagementCanister = mock<ICManagementCanister>();
    vi.spyOn(ICManagementCanister, "create").mockImplementation(
      () => mockICManagementCanister
    );

    mockICManagementCanister.canisterStatus.mockResolvedValue(response);
    // Prevent HttpAgent.create(), which is called by createAgent, from making a
    // real network request via agent.syncTime().
    vi.spyOn(dfinityUtils, "createAgent").mockReturnValue(undefined);
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
