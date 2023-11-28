import {
  getIcrcAccount,
  icrcLedgerCanister,
  queryIcrcToken,
} from "$lib/api/icrc-ledger.api";
import type { Account, AccountType } from "$lib/types/account";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import type { IcrcAccount } from "@dfinity/ledger-icrc";
import type { Principal } from "@dfinity/principal";

export const getCkBTCAccount = async ({
  identity,
  certified,
  canisterId,
  ...rest
}: {
  identity: Identity;
  certified: boolean;
  canisterId: Principal;
  type: AccountType;
} & IcrcAccount): Promise<Account> => {
  logWithTimestamp("Getting ckBTC account: call...");

  const {
    canister: { balance },
  } = await icrcLedgerCanister({ identity, canisterId });

  const callParams = {
    certified,
    getBalance: balance,
  };

  const account = await getIcrcAccount({
    ...rest,
    ...callParams,
  });

  logWithTimestamp("Getting ckBTC account: done");

  return account;
};

export const getCkBTCToken = async (params: {
  identity: Identity;
  certified: boolean;
  canisterId: Principal;
}): Promise<IcrcTokenMetadata> => {
  logWithTimestamp("Getting ckBTC token: call...");

  const token = await queryIcrcToken(params);

  logWithTimestamp("Getting ckBTC token: done");

  return token;
};
