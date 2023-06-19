import type { TVLCanisterOptions } from "$lib/canisters/tvl/tvl.canister.types";
import { Actor } from "@dfinity/agent";
import { Canister, toNullable, type QueryParams } from "@dfinity/utils";
import { idlFactory as certifiedIdlFactory } from "./tvl.certified.idl";
import { idlFactory } from "./tvl.idl";
import type {
  _SERVICE as TVLService,
  TvlRequest,
  TvlResult,
} from "./tvl.types";

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

  public getTVL = async ({
    certified,
    request,
  }: QueryParams & { request?: TvlRequest }): Promise<TvlResult> => {
    const response = await this.caller({ certified }).get_tvl(
      toNullable(request)
    );

    if ("Err" in response) {
      throw new Error(response.Err.message);
    }

    return response.Ok;
  };
}
