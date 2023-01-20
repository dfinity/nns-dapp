<script lang="ts">
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildWalletUrl } from "$lib/utils/navigation.utils";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import { accountsStore } from "$lib/stores/accounts.store";

  const cardClick = async (identifier: string) =>
    await goto(
      buildWalletUrl({
        universe: $pageStore.universe,
        account: identifier,
      })
    );
</script>

<SummaryUniverse />

<div class="card-grid" data-tid="accounts-body">
  {#if $accountsStore?.main?.identifier}
    <AccountCard
      role="link"
      on:click={() => cardClick($accountsStore?.main?.identifier ?? "")}
      hash
      account={$accountsStore?.main}>{$i18n.accounts.main}</AccountCard
    >
    {#each $accountsStore.subAccounts ?? [] as subAccount}
      <AccountCard
        role="link"
        on:click={() => cardClick(subAccount.identifier)}
        hash
        account={subAccount}>{subAccount.name}</AccountCard
      >
    {/each}
    {#each $accountsStore.hardwareWallets ?? [] as walletAccount}
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
