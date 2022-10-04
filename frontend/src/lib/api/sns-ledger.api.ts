import type { Account } from "$lib/types/account";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { mapOptionalToken } from "$lib/utils/sns.utils";
import type { Identity } from "@dfinity/agent";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
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
      // TODO: https://dfinity.atlassian.net/browse/GIX-1045
      token: mapOptionalToken(metadata) ?? ICPToken,
    }),
    type: "main",
  };

  logWithTimestamp("Getting sns neuron: done");
  return [mainAccount];
};
