import { Actor, type CallConfig } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import type {
  CanisterDetails,
  ICMgtCanisterOptions,
} from "./ic-management.canister.types";
import { toHttpError, UserNotTheController } from "./ic-management.errors";
import { idlFactory } from "./ic-management.idl";
import type { CanisterStatusResponse, _SERVICE } from "./ic-management.types";
import { getCanisterStatus } from "./utils";

function transform(
  _methodName: string,
  args: unknown[],
  // eslint-disable-next-line
  _callConfig: CallConfig
) {
  // eslint-disable-next-line
  const first = args[0] as any;
  let effectiveCanisterId = Principal.fromText("aaaaa-aa");
  if (
    first !== undefined &&
    typeof first === "object" &&
    first.canister_id !== undefined
  ) {
    effectiveCanisterId = Principal.from(first.canister_id as unknown);
  }
  return { effectiveCanisterId };
}

export class ICManagementCanister {
  private constructor(private readonly service: _SERVICE) {
    this.service = service;
  }

  public static create(options: ICMgtCanisterOptions) {
    const agent = options.agent;
    const canisterId = options.canisterId;

    const service = Actor.createActor<_SERVICE>(idlFactory, {
      agent,
      canisterId,
      ...{
        callTransform: transform,
        queryTransform: transform,
      },
    });

    return new ICManagementCanister(service);
  }

  /**
   *
   * @param canisterIdString
   * @returns CanisterDetails
   * @throws UserNotTheController, Error
   */
  public getCanisterDetails = async (
    canisterIdString: string
  ): Promise<CanisterDetails> => {
    let rawResponse: CanisterStatusResponse;
    try {
      rawResponse = await this.service.canister_status({
        canister_id: Principal.fromText(canisterIdString),
      });
    } catch (e) {
      const httpError = toHttpError(e);
      if (httpError.code === 403) {
        throw new UserNotTheController();
      } else {
        throw e;
      }
    }

    return {
      status: getCanisterStatus(rawResponse),
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
      moduleHash:
        rawResponse.module_hash.length > 0 &&
        rawResponse.module_hash[0] !== undefined
          ? new Uint8Array(rawResponse.module_hash[0]).buffer
          : undefined,
    };
  };
}
