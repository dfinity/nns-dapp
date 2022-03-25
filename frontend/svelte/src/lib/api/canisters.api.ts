import type { Identity } from "@dfinity/agent";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import type { CanisterDetails } from "../canisters/nns-dapp/nns-dapp.types";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
import { identityServiceURL } from "../constants/identity.constants";
import { createAgent } from "../utils/agent.utils";

export const queryCanisters = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<CanisterDetails[]> => {
  const agent = await createAgent({ identity, host: identityServiceURL });

  const nnsDapp: NNSDappCanister = NNSDappCanister.create({
    agent,
    canisterId: OWN_CANISTER_ID,
  });

  return nnsDapp.getCanisters({ certified });
};
