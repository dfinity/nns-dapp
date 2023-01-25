import { createAgent } from "$lib/api/agent.api";
import { getIcrcMainAccount } from "$lib/api/icrc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { HOST } from "$lib/constants/environment.constants";
import type { Account } from "$lib/types/account";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { HttpAgent, Identity } from "@dfinity/agent";
import { IcrcLedgerCanister } from "@dfinity/ledger";

export const getCkBTCAccounts = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  logWithTimestamp("Getting ckBTC accounts: call...");

  const {
    canister: { metadata, balance },
  } = await ckBTCCanister({ identity });

  const mainAccount = await getIcrcMainAccount({
    identity,
    certified,
    balance,
    metadata,
  });

  logWithTimestamp("Getting ckBTC accounts: done");

  return [mainAccount];
};

export const ckBTCCanister = async ({
  identity,
}: {
  identity: Identity;
}): Promise<{
  canister: IcrcLedgerCanister;
  agent: HttpAgent;
}> => {
  const agent = await createAgent({
    identity,
    host: HOST,
  });

  const canister = IcrcLedgerCanister.create({
    agent,
    canisterId: CKBTC_LEDGER_CANISTER_ID,
  });

  return {
    canister,
    agent,
  };
};
