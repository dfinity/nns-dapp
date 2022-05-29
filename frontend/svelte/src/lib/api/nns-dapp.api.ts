import type { HttpAgent, Identity } from "@dfinity/agent";
import { NNSDappCanister } from "../canisters/nns-dapp/nns-dapp.canister";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
import { HOST } from "../constants/environment.constants";
import { createAgent } from "../utils/agent.utils";

export const nnsDappCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: NNSDappCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({ identity, host: HOST });

  const canister: NNSDappCanister = NNSDappCanister.create({
    agent,
    canisterId: OWN_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
