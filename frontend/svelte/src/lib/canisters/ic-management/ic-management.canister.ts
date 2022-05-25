import {
  getManagementCanister,
  type ManagementCanisterRecord,
} from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { toCanisterDetails } from "./converters";
import type {
  CanisterDetails,
  ICMgtCanisterOptions,
} from "./ic-management.canister.types";
import { mapError } from "./ic-management.errors";
import type { CanisterStatusResponse } from "./ic-management.types";

export class ICManagementCanister {
  private constructor(private readonly service: ManagementCanisterRecord) {
    this.service = service;
  }

  public static create(options: ICMgtCanisterOptions) {
    const agent = options.agent;

    const service = options.serviceOverride ?? getManagementCanister({ agent });

    return new ICManagementCanister(service);
  }

  /**
   * Returns canister data
   *
   * @param {Principal} canisterId
   * @returns Promise<CanisterDetails>
   * @throws UserNotTheController, Error
   */
  public getCanisterDetails = async (
    canisterId: Principal
  ): Promise<CanisterDetails> => {
    try {
      const rawResponse: CanisterStatusResponse =
        await this.service.canister_status({
          canister_id: canisterId,
        });
      return toCanisterDetails({
        response: rawResponse,
        canisterId,
      });
    } catch (e) {
      throw mapError(e);
    }
  };
}
