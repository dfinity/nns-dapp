import { NNSDappCanister } from "../../lib/canisters/nns-dapp/nns-dapp.canister";
import type { CanisterDetails } from "../../lib/canisters/nns-dapp/nns-dapp.types";
import { mockCanisters } from "./canisters.mock";

// @ts-ignore
export class MockNNSDappCanister extends NNSDappCanister {
  constructor() {
    super(null, null);
  }

  create() {
    return this;
  }

  public override getCanisters = async ({
    certified,
  }: {
    certified: boolean;
  }): Promise<CanisterDetails[]> => {
    return mockCanisters;
  };
}
