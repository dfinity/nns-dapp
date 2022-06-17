import {
  getManagementCanister,
  type ManagementCanisterRecord,
} from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { toCanisterDetails } from "./converters";
import type {
  CanisterDetails,
  CanisterSettings,
  ICMgtCanisterOptions,
} from "./ic-management.canister.types";
import { mapError } from "./ic-management.errors";
import type { CanisterStatusResponse } from "./ic-management.types";

const wrapWithArray = <T>(value: T | undefined): [T] | [] =>
  value === undefined ? [] : [value];

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

  /**
   * Update canister settings
   *
   * @param {Object} params
   * @param {Principal} params.canisterId
   * @param {CanisterSettings} params.settings
   * @returns Promise<void>
   * @throws UserNotTheController, Error
   */
  public updateSettings = async ({
    canisterId,
    settings: {
      controllers,
      freezingThreshold,
      memoryAllocation,
      computeAllocation,
    },
  }: {
    canisterId: Principal;
    settings: Partial<CanisterSettings>;
  }): Promise<void> => {
    try {
      // Empty array does not change the value in the settings.
      await this.service.update_settings({
        canister_id: canisterId,
        settings: {
          controllers: wrapWithArray(
            controllers?.map((c) => Principal.fromText(c))
          ),
          freezing_threshold: wrapWithArray(freezingThreshold),
          memory_allocation: wrapWithArray(memoryAllocation),
          compute_allocation: wrapWithArray(computeAllocation),
        },
      });
    } catch (e) {
      throw mapError(e);
    }
  };
}
