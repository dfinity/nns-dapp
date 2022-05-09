import type { Identity } from "@dfinity/agent";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { logWithTimestamp } from "../utils/dev.utils";
import { nnsDappCanister } from "./nns-dapp.api";

export const queryCanisters = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<CanisterDetails[]> => {
  logWithTimestamp(`Querying Canisters certified:${certified} call...`);
  const { canister } = await nnsDappCanister({ identity });

  const response = await canister.getCanisters({ certified });

  logWithTimestamp(`Querying Canisters certified:${certified} complete.`);

  return response;
};
