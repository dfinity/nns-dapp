import { Actor } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import type { CMCCanisterOptions } from "./cmc.canister.types";
import { throwNotifyError } from "./cmc.errors";
import { idlFactory } from "./cmc.idl";
import type {
  NotifyCreateCanisterArg,
  NotifyTopUpArg,
  _SERVICE,
} from "./cmc.types";

const CYCLES_PER_XDR = BigInt(1_000_000_000_000); // 1 trillion

export class CMCCanister {
  private constructor(private readonly service: _SERVICE) {
    this.service = service;
  }

  public static create(options: CMCCanisterOptions) {
    const agent = options.agent;
    const canisterId = options.canisterId;

    const service =
      options.serviceOverride ??
      Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
      });

    return new CMCCanister(service);
  }

  public getIcpToCyclesConversionRate = async (): Promise<bigint> => {
    const response = await this.service.get_icp_xdr_conversion_rate();

    // TODO validate the certificate in the response
    return (
      (response.data.xdr_permyriad_per_icp * CYCLES_PER_XDR) / BigInt(10_000)
    );
  };

  public notifyCreateCanister = async (
    request: NotifyCreateCanisterArg
  ): Promise<Principal> => {
    const response = await this.service.notify_create_canister(request);
    if ("Err" in response) {
      throwNotifyError(response);
    }
    if ("Ok" in response) {
      return response.Ok;
    }
    // Edge case
    throw new Error(
      `Unsupported response type in notifyCreateCanister ${JSON.stringify(
        response
      )}`
    );
  };

  public notifyTopUp = async (request: NotifyTopUpArg): Promise<void> => {
    const response = await this.service.notify_top_up(request);
    if ("Err" in response) {
      throwNotifyError(response);
    }
  };
}
