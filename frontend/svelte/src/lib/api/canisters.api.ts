import type { Identity } from "@dfinity/agent";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
import { createAgent } from "../utils/agent.utils";
import { logWithTimestamp } from "../utils/dev.utils";
import { HOST } from "./environment.constants.api";

export const queryCanisters = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<CanisterDetails[]> => {
  logWithTimestamp(`Querying Canisters certified:${certified} call...`);
  const agent = await createAgent({ identity, host: HOST });

  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent,
    canisterId: OWN_CANISTER_ID,
  });

  const response = await nnsDapp.getCanisters({ certified });
  logWithTimestamp(`Querying Canisters certified:${certified} complete.`);
  return response;
};
