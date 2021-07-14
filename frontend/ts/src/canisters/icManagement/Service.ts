import { Principal } from "@dfinity/principal";
import { definite_canister_settings, _SERVICE } from "./rawService";
import ServiceInterface, {
  CanisterStatus,
  CanisterDetailsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from "./model";
import { CanisterIdString } from "../common/types";
import * as convert from "../converter";
import { toHttpError } from "../httpError";
import { UnsupportedValueError } from "../../utils";

interface CanisterStatusResponse {
  status: { stopped: null } | { stopping: null } | { running: null };
  memory_size: bigint;
  cycles: bigint;
  settings: definite_canister_settings;
  module_hash: [] | [Array<number>];
}

export default class Service implements ServiceInterface {
  private readonly service: _SERVICE;

  public constructor(service: _SERVICE) {
    this.service = service;
  }

  public getCanisterDetails = async (
    canisterId: CanisterIdString
  ): Promise<CanisterDetailsResponse> => {
    let rawResponse: CanisterStatusResponse;
    try {
      rawResponse = await this.service.canister_status({
        canister_id: Principal.fromText(canisterId),
      });
    } catch (e) {
      const httpError = toHttpError(e);
      if (httpError.code === 403) {
        return { kind: "userNotTheController" };
      } else {
        throw e;
      }
    }

    const result: CanisterDetailsResponse = {
      kind: "success",
      details: {
        status: this.getCanisterStatus(rawResponse),
        memorySize: rawResponse.memory_size,
        cycles: rawResponse.cycles,
        setting: {
          controllers: rawResponse.settings.controllers.map((principal) =>
            principal.toText()
          ),
          freezingThreshold: rawResponse.settings.freezing_threshold,
          memoryAllocation: rawResponse.settings.memory_allocation,
          computeAllocation: rawResponse.settings.compute_allocation,
        },
        moduleHash: rawResponse.module_hash.length
          ? convert.arrayOfNumberToArrayBuffer(rawResponse.module_hash[0])
          : null,
      },
    };

    return result;
  };

  public updateSettings = async (
    request: UpdateSettingsRequest
  ): Promise<UpdateSettingsResponse> => {
    const settings = request.settings;
    try {
      await this.service.update_settings({
        canister_id: Principal.fromText(request.canisterId),
        settings: {
          controllers: settings.controllers
            ? [settings.controllers.map((c) => Principal.fromText(c))]
            : [],
          freezing_threshold: settings.freezingThreshold
            ? [settings.freezingThreshold]
            : [],
          memory_allocation: settings.memoryAllocation
            ? [settings.memoryAllocation]
            : [],
          compute_allocation: settings.computeAllocation
            ? [settings.computeAllocation]
            : [],
        },
      });
      return { kind: "success" };
    } catch (e) {
      const httpError = toHttpError(e);
      if (httpError.code === 403) {
        return { kind: "userNotTheController" };
      } else {
        throw e;
      }
    }
  };

  private getCanisterStatus(
    rawResponse: CanisterStatusResponse
  ): CanisterStatus {
    if ("stopped" in rawResponse.status) {
      return CanisterStatus.Stopped;
    } else if ("stopping" in rawResponse.status) {
      return CanisterStatus.Stopping;
    } else if ("running" in rawResponse.status) {
      return CanisterStatus.Running;
    }
    throw new UnsupportedValueError(rawResponse.status);
  }
}
