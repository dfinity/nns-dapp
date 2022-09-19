import type { Identity } from "@dfinity/agent";
import { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
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

  const [mainBalanceE8s, metadata] = await Promise.all([
    balance({ owner: identity.getPrincipal() }),
    ledgerMetadata({}),
  ]);

  const mainAccount: Account = {
    // TODO: Implement string representation https://dfinity.atlassian.net/browse/GIX-1025
    identifier: "sns-main-account-identifier",
    principal: identity.getPrincipal(),
    balance: TokenAmount.fromE8s({
      amount: mainBalanceE8s,
      token: mapOptionalToken(metadata),
    }),
    type: "main",
  };

  logWithTimestamp("Getting sns neuron: done");
  return [mainAccount];
};
