import { createAgent } from "$lib/api/agent.api";
import { toCanisterDetails } from "$lib/canisters/ic-management/converters";
import { ICManagementCanister } from "$lib/canisters/ic-management/ic-management.canister";
import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCanisterDetails,
  mockCanisterId,
  mockCanisterSettings,
} from "$tests/mocks/canisters.mock";
import type { ActorSubclass } from "@dfinity/agent";
import type { CanisterStatusResponse } from "@dfinity/ic-management";
import type { _SERVICE as IcManagementService } from "@dfinity/ic-management/dist/candid/ic-management";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";

describe("ICManagementCanister", () => {
  const createICManagement = async (service: IcManagementService) => {
    const defaultAgent = await createAgent({ identity: mockIdentity });

    return ICManagementCanister.create({
      agent: defaultAgent,
      serviceOverride: service as ActorSubclass<IcManagementService>,
    });
  };

  describe("ICManagementCanister.getCanisterDetails", () => {
    it("returns account identifier when success", async () => {
      const settings = {
        freezing_threshold: BigInt(2),
        controllers: [
          Principal.fromText(
            "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
          ),
        ],
        memory_allocation: BigInt(4),
        compute_allocation: BigInt(10),
      };
      const response: CanisterStatusResponse = {
        status: { running: null },
        memory_size: BigInt(1000),
        cycles: BigInt(10_000),
        settings,
        module_hash: [],
        idle_cycles_burned_per_day: BigInt(30_000),
      };
      const service = mock<IcManagementService>();
      service.canister_status.mockResolvedValue(response);

      const icManagement = await createICManagement(service);

      const res = await icManagement.getCanisterDetails(mockCanisterDetails.id);

      expect(res).toEqual(
        toCanisterDetails({ response, canisterId: mockCanisterDetails.id })
      );
    });

    it("throws UserNotTheControllerError", async () => {
      const error = new Error("code: 403");
      const service = mock<IcManagementService>();
      service.canister_status.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.getCanisterDetails(Principal.fromText("aaaaa-aa"));

      expect(call).rejects.toThrowError(UserNotTheControllerError);
    });

    it("throws Error", async () => {
      const error = new Error("Test");
      const service = mock<IcManagementService>();
      service.canister_status.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.getCanisterDetails(Principal.fromText("aaaaa-aa"));

      expect(call).rejects.toThrowError(Error);
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
      const error = new Error("code: 403");
      const service = mock<IcManagementService>();
      service.update_settings.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () =>
        icManagement.updateSettings({
          canisterId: mockCanisterId,
          settings: mockCanisterSettings,
        });
      expect(call).rejects.toThrowError(UserNotTheControllerError);
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
      expect(call).rejects.toThrowError(Error);
    });
  });
});
