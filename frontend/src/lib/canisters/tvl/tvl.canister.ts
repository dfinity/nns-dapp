import type { TVLCanisterOptions } from "$lib/canisters/tvl/tvl.canister.types";
import { Actor } from "@dfinity/agent";
import { Canister } from "@dfinity/utils";
import { idlFactory as certifiedIdlFactory } from "./tvl.certified.idl";
import { idlFactory } from "./tvl.idl";
import type { TvlResult, _SERVICE as TVLService } from "./tvl.types";

export class TVLCanister extends Canister<TVLService> {
  public static create(options: TVLCanisterOptions): TVLCanister {
    const agent = options.agent;
    const canisterId = options.canisterId;

    const service = Actor.createActor<TVLService>(idlFactory, {
      agent,
      canisterId,
    });

    const certifiedService = Actor.createActor<TVLService>(
      certifiedIdlFactory,
      {
        agent,
        canisterId,
      }
    );

    return new TVLCanister(canisterId, service, certifiedService);
  }

  public getTVL = async (params: {
    certified: boolean;
  }): Promise<TvlResult> => {
    const response = await this.caller(params).get_tvl();

    if ("Err" in response) {
      throw new Error(response.Err.message);
    }

    return response.Ok;
  };
}
