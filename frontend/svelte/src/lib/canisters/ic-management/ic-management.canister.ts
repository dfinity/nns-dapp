import { Actor, type CallConfig } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { toCanisterDetails } from "./converters";
import type {
  CanisterDetails,
  ICMgtCanisterOptions,
} from "./ic-management.canister.types";
import { toHttpError, UserNotTheControllerError } from "./ic-management.errors";
import { idlFactory } from "./ic-management.idl";
import type { CanisterStatusResponse, _SERVICE } from "./ic-management.types";

// This is needed when creating the actor.
// IC Management is a special canister
// https://smartcontracts.org/docs/current/references/ic-interface-spec/#ic-management-canister
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

    const service =
      options.serviceOverride ??
      Actor.createActor<_SERVICE>(idlFactory, {
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
   * Returns canister data
   *
   * @param {string} canisterIdString
   * @returns Promise<CanisterDetails>
   * @throws UserNotTheController, Error
   */
  public getCanisterDetails = async (
    canisterIdString: string
  ): Promise<CanisterDetails> => {
    let rawResponse: CanisterStatusResponse;
    let principal: Principal;
    try {
      principal = Principal.fromText(canisterIdString);
      rawResponse = await this.service.canister_status({
        canister_id: principal,
      });
    } catch (e) {
      const httpError = toHttpError(e);
      if (httpError.code === 403) {
        throw new UserNotTheControllerError();
      } else {
        throw e;
      }
    }

    return toCanisterDetails({
      response: rawResponse,
      canisterId: principal,
    });
  };
}
