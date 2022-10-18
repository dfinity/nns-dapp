<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "$lib/stores/accounts.store";
  import type { AccountsStore } from "$lib/stores/accounts.store";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { TokenAmount } from "@dfinity/nns";
  import { sumTokenAmounts } from "$lib/utils/token.utils";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import AccountsTitle from "$lib/components/accounts/AccountsTitle.svelte";
  import { goto } from "$app/navigation";
  import { AppRoutes } from "$lib/constants/routes.constants";
  import { routesStore } from "$lib/stores/routes.stores";

  let accounts: AccountsStore | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (storeData: AccountsStore) => (accounts = storeData)
  );

  // TODO(GIX-1071): extract utils to navigate or at least build the url to goto
  const cardClick = async (identifier: string) =>
    await goto(
      `${AppRoutes.Wallet}/?u=${$routesStore.universe}&id=${identifier}`
    );

  onDestroy(unsubscribe);

  let totalBalance: TokenAmount | undefined;
  $: totalBalance =
    accounts?.main?.balance !== undefined
      ? sumTokenAmounts(
          accounts?.main?.balance,
          ...(accounts?.subAccounts || []).map(({ balance }) => balance),
          ...(accounts?.hardwareWallets || []).map(({ balance }) => balance)
        )
      : undefined;
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
