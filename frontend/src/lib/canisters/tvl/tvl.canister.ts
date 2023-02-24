import type { TVLCanisterOptions } from "$lib/canisters/tvl/tvl.canister.types";
import { Actor } from "@dfinity/agent";
import type { TvlResult, _SERVICE as TVLService } from "./tvl";
import { idlFactory as certifiedIdlFactory } from "./tvl.certified.idl";
import { idlFactory } from "./tvl.idl";

export class TVLCanister {
  private constructor(
    private readonly service: TVLService,
    private readonly certifiedService: TVLService
  ) {
    this.service = service;
    this.certifiedService = certifiedService;
  }

  public static create(options: TVLCanisterOptions) {
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

    return new TVLCanister(service, certifiedService);
  }

  private caller = ({ certified = true }: { certified: boolean }): TVLService =>
    certified ? this.certifiedService : this.service;

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
