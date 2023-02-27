import { createAgent } from "$lib/api/agent.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import type { HttpAgent, Identity } from "@dfinity/agent";

export const getOrCreateAccount = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AccountDetails> => {
  const { canister } = await nnsDappCanister({ identity });

  try {
    return await canister.getAccount({ certified });
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      // Ensure account exists in NNSDapp Canister
      // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L271
      // https://github.com/dfinity/nns-dapp/blob/main/rs/src/accounts_store.rs#L232
      await canister.addAccount();
      return canister.getAccount({ certified });
    }
    throw error;
  }
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
