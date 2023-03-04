import { createAgent } from "$lib/api/agent.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";

export const addAccount = async (identity: Identity): Promise<void> => {
  logWithTimestamp("Adding account call...");
  const { canister } = await nnsDappCanister({ identity });
  await canister.addAccount();
  logWithTimestamp("Adding account call complete.");
};

export const queryAccount = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountDetails> => {
  logWithTimestamp("Getting account call...");
  const { canister } = await nnsDappCanister({ identity });
  const account = await canister.getAccount({ certified });
  logWithTimestamp("Getting account call complete.");
  return account;
};

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
