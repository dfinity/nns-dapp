import type {
  GetTVLRequest,
  GetTVLResult,
  TVLCanisterOptions,
} from "$lib/canisters/tvl/tvl.canister.types";
import { idlFactory as certifiedIdlFactory } from "$lib/canisters/tvl/tvl.certified.idl";
import { idlFactory } from "$lib/canisters/tvl/tvl.idl";
import type { _SERVICE as TVLService } from "$lib/canisters/tvl/tvl.types";
import { Actor } from "@dfinity/agent";
import { Canister, nonNullish, toNullable } from "@dfinity/utils";

export class TVLCanister extends Canister<TVLService> {
  public static create(options: TVLCanisterOptions): TVLCanister {
    const agent = options.agent;
    const canisterId = options.canisterId;

    const service =
      options.serviceOverride ??
      Actor.createActor<TVLService>(idlFactory, {
        agent,
        canisterId,
      });

    const certifiedService =
      options.certifiedServiceOverride ??
      Actor.createActor<TVLService>(certifiedIdlFactory, {
        agent,
        canisterId,
      });

    return new TVLCanister(canisterId, service, certifiedService);
  }

  public getTVL = async ({
    certified,
    currency,
  }: GetTVLRequest): Promise<GetTVLResult> => {
    const response = await this.caller({ certified }).get_tvl(
      toNullable(nonNullish(currency) ? { currency } : undefined)
    );

    if ("Err" in response) {
      throw new Error(response.Err.message);
    }

    return {
      ...response.Ok,
      currency,
    };
  };
}
