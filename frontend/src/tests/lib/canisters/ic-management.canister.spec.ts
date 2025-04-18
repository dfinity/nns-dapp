import { toCanisterDetails } from "$lib/canisters/ic-management/converters";
import { ICManagementCanister } from "$lib/canisters/ic-management/ic-management.canister";
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import {
  mockCanisterDetails,
  mockCanisterId,
  mockCanisterSettings,
} from "$tests/mocks/canisters.mock";
import type { ActorSubclass, HttpAgent } from "@dfinity/agent";
import type { CanisterStatusResponse } from "@dfinity/ic-management";
import type { _SERVICE as IcManagementService } from "@dfinity/ic-management/dist/candid/ic-management";
import { Principal } from "@dfinity/principal";
import { mock } from "vitest-mock-extended";

describe("ICManagementCanister", () => {
  const createICManagement = async (service: IcManagementService) => {
    return ICManagementCanister.create({
      agent: mock<HttpAgent>(),
      serviceOverride: service as ActorSubclass<IcManagementService>,
    });
  };

  describe("ICManagementCanister.getCanisterDetails", () => {
    it("returns account identifier when success", async () => {
      const settings = {
        wasm_memory_threshold: 1_000_000_000n,
        freezing_threshold: 2n,
        controllers: [
          Principal.fromText(
            "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
          ),
        ],
        reserved_cycles_limit: 1_000_000_000n,
        memory_allocation: 4n,
        compute_allocation: 10n,
        log_visibility: { controllers: null },
        wasm_memory_limit: 1_000_000_000n,
      };
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
        settings,
        module_hash: [],
        idle_cycles_burned_per_day: 30_000n,
        reserved_cycles: 1_000_000n,
        query_stats: {
          num_calls_total: 1n,
          num_instructions_total: 2n,
          request_payload_bytes_total: 3n,
          response_payload_bytes_total: 4n,
        },
      };
      const service = mock<IcManagementService>();
      service.canister_status.mockResolvedValue(response);

      const icManagement = await createICManagement(service);

      const res = await icManagement.getCanisterDetails(mockCanisterDetails.id);

      expect(res).toEqual(
        toCanisterDetails({ response, canisterId: mockCanisterDetails.id })
      );
    });

    it('throws UserNotTheControllerError if "Error Code" is "IC0512"', async () => {
      const error = new Error(`Call failed:
      Canister: aaaaa-aa
      Method: canister_status (update)
      "Request ID": "9dac7652f94de82d72f00ee492c132defc48da8dd6043516312275ab0fa5b5e1"
      "Error code": "IC0512"
      "Reject code": "5"
      "Reject message": "Only controllers of canister mwewp-s4aaa-aaaaa-qabjq-cai can call ic00 method canister_status"`);
      const service = mock<IcManagementService>();
      service.canister_status.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.getCanisterDetails(Principal.fromText("aaaaa-aa"));

      await expect(call).rejects.toThrowError(UserNotTheControllerError);
    });

    it('throws Error if "IC0512" is present, but not as "Error Code"', async () => {
      const error = new Error(`Call failed:
      Canister: aaaaa-aa
      Method: canister_status (update)
      "Request ID": "IC0512"
      "Error code": "Another code"
      "Reject code": "5"
      "Reject message": "..."`);
      const service = mock<IcManagementService>();
      service.canister_status.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.getCanisterDetails(Principal.fromText("aaaaa-aa"));

      await expect(call).rejects.toThrowError(Error);
    });

    it("throws Error", async () => {
      const error = new Error("Test");
      const service = mock<IcManagementService>();
      service.canister_status.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.getCanisterDetails(Principal.fromText("aaaaa-aa"));

      await expect(call).rejects.toThrowError(Error);
    });
  });

  describe("updateSettings", () => {
    it("calls update_settings with new settings", async () => {
      const service = mock<IcManagementService>();
      service.update_settings.mockResolvedValue(undefined);

      const icManagement = await createICManagement(service);

      await icManagement.updateSettings({
        canisterId: mockCanisterId,
        settings: mockCanisterSettings,
      });
      expect(service.update_settings).toBeCalled();
    });

    it("works when passed partial settings", async () => {
      const partialSettings = {
        controllers: [
          "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe",
        ],
      };
      const service = mock<IcManagementService>();
      service.update_settings.mockResolvedValue(undefined);

      const icManagement = await createICManagement(service);

      await icManagement.updateSettings({
        canisterId: mockCanisterId,
        settings: partialSettings,
      });
      expect(service.update_settings).toBeCalled();
    });

    it("throws UserNotTheControllerError", async () => {
      const error = new Error(`Call failed:
      Canister: aaaaa-aa
      Method: canister_status (update)
      "Request ID": "9dac7652f94de82d72f00ee492c132defc48da8dd6043516312275ab0fa5b5e1"
      "Error code": "IC0512"
      "Reject code": "5"
      "Reject message": "Only controllers of canister mwewp-s4aaa-aaaaa-qabjq-cai can call ic00 method canister_status"`);
      const service = mock<IcManagementService>();
      service.update_settings.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.updateSettings({
          canisterId: mockCanisterId,
          settings: mockCanisterSettings,
        });
      await expect(call).rejects.toThrowError(UserNotTheControllerError);
    });

    it("throws Error", async () => {
      const error = new Error("Test");
      const service = mock<IcManagementService>();
      service.update_settings.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.updateSettings({
          canisterId: mockCanisterId,
          settings: mockCanisterSettings,
        });
      await expect(call).rejects.toThrowError(Error);
    });
  });
});
