<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { accountsStore } from "$lib/stores/accounts.store";
  import type { AccountsStore } from "$lib/stores/accounts.store";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { TokenAmount } from "@dfinity/nns";
  import { sumTokenAmounts } from "$lib/utils/token.utils";
  import AccountsTitle from "$lib/components/accounts/AccountsTitle.svelte";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildWalletUrl } from "$lib/utils/navigation.utils";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { sumAccounts } from "$lib/utils/accounts.utils";

  let accounts: AccountsStore | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (storeData: AccountsStore) => (accounts = storeData)
  );

  const cardClick = async (identifier: string) =>
    await goto(
      buildWalletUrl({
        universe: $pageStore.universe,
        account: identifier,
      })
    );

  onDestroy(unsubscribe);

  let totalBalance: TokenAmount | undefined;
  $: totalBalance = sumAccounts(accounts);
</script>

<AccountsTitle balance={totalBalance} />

<div class="card-grid" data-tid="accounts-body">
  {#if accounts?.main?.identifier}
    <AccountCard
      role="link"
      on:click={() => cardClick(accounts?.main?.identifier ?? "")}
      hash
      account={accounts?.main}>{$i18n.accounts.main}</AccountCard
    >
    {#each accounts.subAccounts ?? [] as subAccount}
      <AccountCard
        role="link"
        on:click={() => cardClick(subAccount.identifier)}
        hash
        account={subAccount}>{subAccount.name}</AccountCard
      >
    {/each}
    {#each accounts.hardwareWallets ?? [] as walletAccount}
      <AccountCard
        role="link"
        on:click={() => cardClick(walletAccount.identifier)}
        hash
        account={walletAccount}>{walletAccount.name}</AccountCard
      >
    {/each}
  {:else}
    <SkeletonCard size="medium" />
  {/if}
</div>
