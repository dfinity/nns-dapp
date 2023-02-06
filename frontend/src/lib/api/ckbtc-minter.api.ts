import { createAgent } from "$lib/api/agent.api";
import { CKBTC_MINTER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { CkBTCMinterCanister } from "@dfinity/ckbtc";

export const getBTCAddress = async ({
  identity,
}: {
  identity: Identity;
}): Promise<string> => {
  logWithTimestamp("Getting BTC address: call...");

  const {
    canister: { getBtcAddress: getBTCAddressApi },
  } = await ckBTCMinterCanister({ identity });

  // We use the identity to follow NNS-dapp's scheme but, if it would not be provided, it would be the same result. If "owner" is not provided, the minter canister uses the "caller" as a fallback.
  // TODO: Support subaccounts
  const address = await getBTCAddressApi({
    owner: identity.getPrincipal(),
  });

  logWithTimestamp("Getting BTC address: done");

  return address;
};

const ckBTCMinterCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: CkBTCMinterCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = CkBTCMinterCanister.create({
    agent,
    canisterId: CKBTC_MINTER_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
