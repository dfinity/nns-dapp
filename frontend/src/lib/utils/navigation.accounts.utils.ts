import { goto } from "$app/navigation";
import type { Account } from "$lib/types/account";
import { buildWalletUrl } from "$lib/utils/navigation.utils";

export const goToWallet = async ({
  account: { identifier },
  universe,
}: {
  account: Account;
  universe: string;
}) =>
  await goto(
    buildWalletUrl({
      universe,
      account: identifier,
    })
  );
