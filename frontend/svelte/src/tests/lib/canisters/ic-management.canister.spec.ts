import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import { toCanisterDetails } from "../../../lib/canisters/ic-management/converters";
import { ICManagementCanister } from "../../../lib/canisters/ic-management/ic-management.canister";
import { UserNotTheControllerError } from "../../../lib/canisters/ic-management/ic-management.errors";
import type {
  CanisterStatusResponse,
  _SERVICE as ICManagementService,
} from "../../../lib/canisters/ic-management/ic-management.types";
import { createAgent } from "../../../lib/utils/agent.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";

describe("ICManagementCanister", () => {
  const createICManagement = async (service: ICManagementService) => {
    const defaultAgent = await createAgent({ identity: mockIdentity });
    const canisterId = Principal.fromText("aaaaa-aa");

    return ICManagementCanister.create({
      agent: defaultAgent,
      serviceOverride: service,
      canisterId,
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
      };
      const service = mock<ICManagementService>();
      service.canister_status.mockResolvedValue(response);

      const icManagement = await createICManagement(service);

      const res = await icManagement.getCanisterDetails("aaaaa-aa");

      expect(res).toEqual(toCanisterDetails(response));
    });

    it("throws UserNotTheControllerError", async () => {
      const error = new Error("code: 403");
      const service = mock<ICManagementService>();
      service.canister_status.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () => icManagement.getCanisterDetails("aaaaa-aa");

      expect(call).rejects.toThrowError(UserNotTheControllerError);
    });

    it("throws Error", async () => {
      const error = new Error("Test");
      const service = mock<ICManagementService>();
      service.canister_status.mockRejectedValue(error);

      const icManagement = await createICManagement(service);

      const call = () => icManagement.getCanisterDetails("aaaaa-aa");

      expect(call).rejects.toThrowError(Error);
    });
  });
});
