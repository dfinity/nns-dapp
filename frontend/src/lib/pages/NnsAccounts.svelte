<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "../stores/accounts.store";
  import type { AccountsStore } from "../stores/accounts.store";
  import AccountCard from "../components/accounts/AccountCard.svelte";
  import { i18n } from "../stores/i18n";
  import { routeStore } from "../stores/route.store";
  import { AppPath } from "../constants/routes.constants";
  import { TokenAmount } from "@dfinity/nns";
  import { formatICP, sumTokenAmounts } from "../utils/icp.utils";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import AccountsTitle from "../components/accounts/AccountsTitle.svelte";

  let accounts: AccountsStore | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (storeData: AccountsStore) => (accounts = storeData)
  );

  const cardClick = (identifier: string) =>
    routeStore.navigate({ path: `${AppPath.Wallet}/${identifier}` });

  onDestroy(unsubscribe);

  let totalBalance: TokenAmount;
  let totalICP: string;
  const zeroICPs = TokenAmount.fromE8s({
    amount: BigInt(0),
    token: accounts?.main?.balance.token,
  });
  $: {
    totalBalance = sumTokenAmounts(
      accounts?.main?.balance || zeroICPs,
      ...(accounts?.subAccounts || []).map(({ balance }) => balance),
      ...(accounts?.hardwareWallets || []).map(({ balance }) => balance)
    );
    totalICP = formatICP({
      value: totalBalance.toE8s(),
      detailed: true,
    });
  }
</script>

<section data-tid="accounts-body">
  <AccountsTitle balance={totalBalance} />

  {#if accounts?.main?.identifier}
    <AccountCard
      role="link"
      on:click={() => cardClick(accounts?.main?.identifier ?? "")}
      showCopy
      account={accounts?.main}>{$i18n.accounts.main}</AccountCard
    >
    {#each accounts.subAccounts ?? [] as subAccount}
      <AccountCard
        role="link"
        on:click={() => cardClick(subAccount.identifier)}
        showCopy
        account={subAccount}>{subAccount.name}</AccountCard
      >
    {/each}
    {#each accounts.hardwareWallets ?? [] as walletAccount}
      <AccountCard
        role="link"
        on:click={() => cardClick(walletAccount.identifier)}
        showCopy
        account={walletAccount}>{walletAccount.name}</AccountCard
      >
    {/each}
  {:else}
    <SkeletonCard />
  {/if}
</section>
