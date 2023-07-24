import type { ICManagementCanisterOptions } from "@dfinity/ic-management";
import {
  ICManagementCanister as ICMgmtCanister,
  type CanisterStatusResponse,
} from "@dfinity/ic-management";
import type { Principal } from "@dfinity/principal";
import { toCanisterDetails } from "./converters";
import type {
  CanisterDetails,
  CanisterSettings,
} from "./ic-management.canister.types";
import { mapError } from "./ic-management.errors";

/**
 * The ICManagementCanister was initially implemented here, but it has since been moved to ic-js and packaged as a standalone library.
 * In order to maintain backwards compatibility and facilitate integration into NNS-dapp, we wrapped the new library within the existing wrapper, which extends the response of the canister.
 *
 * TODO: remove this wrapper and mapping of the types and use @dfinity/ic-management library only.
 */
export class ICManagementCanister {
  private readonly icMgmt: ICMgmtCanister;

  private constructor(options: ICManagementCanisterOptions) {
    this.icMgmt = ICMgmtCanister.create({
      agent: options.agent,
      serviceOverride: options.serviceOverride,
    });
  }

  public static create(options: ICManagementCanisterOptions) {
    return new ICManagementCanister(options);
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
        await this.icMgmt.canisterStatus(canisterId);
      return toCanisterDetails({
        response: rawResponse,
        canisterId,
      });
    } catch (error: unknown) {
      throw mapError(error);
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
  public updateSettings = async (params: {
    canisterId: Principal;
    settings: Partial<CanisterSettings>;
  }): Promise<void> => {
    try {
      // Empty array does not change the value in the settings.
      await this.icMgmt.updateSettings(params);
    } catch (error: unknown) {
      throw mapError(error);
    }
  };
}
