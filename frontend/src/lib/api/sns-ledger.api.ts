import type { Identity } from "@dfinity/agent";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { encodeSnsAccount } from "@dfinity/sns";
import type { Account } from "../types/account";
import { logWithTimestamp } from "../utils/dev.utils";
import { mapOptionalToken } from "../utils/sns.utils";
import { wrapper } from "./sns-wrapper.api";

export const getSnsAccounts = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<Account[]> => {
  // TODO: Support subaccounts
  logWithTimestamp("Getting sns accounts: call...");
  const { balance, ledgerMetadata } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const snsMainAccount = { owner: identity.getPrincipal() };
  const [mainBalanceE8s, metadata] = await Promise.all([
    balance(snsMainAccount),
    ledgerMetadata({}),
  ]);

  const mainAccount: Account = {
    identifier: encodeSnsAccount(snsMainAccount),
    principal: identity.getPrincipal(),
    balance: TokenAmount.fromE8s({
      amount: mainBalanceE8s,
      // TODO: https://dfinity.atlassian.net/browse/GIX-1045
      token: mapOptionalToken(metadata) ?? ICPToken,
    }),
    type: "main",
  };

  logWithTimestamp("Getting sns neuron: done");
  return [mainAccount];
};

export const transactionFee = async ({
  rootCanisterId,
  identity,
  certified,
}: {
  rootCanisterId: Principal;
  identity: Identity;
  certified: boolean;
}): Promise<bigint> => {
  logWithTimestamp("Getting sns transaction fee: call...");
  const { transactionFee: transactionFeeApi } = await wrapper({
    identity,
    rootCanisterId: rootCanisterId.toText(),
    certified,
  });

  const fee = await transactionFeeApi({ certified });

  logWithTimestamp("Getting sns transaction fee: done");
  return fee;
};
