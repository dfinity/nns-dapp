<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import AccountsTitle from "$lib/components/nav/AccountsTitle.svelte";
  import {
    snsOnlyProjectStore,
    snsProjectSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { sumTokenAmounts } from "$lib/utils/token.utils";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { goto } from "$app/navigation";
  import { pageStore } from "$lib/derived/page.derived";
  import { buildWalletUrl } from "$lib/utils/navigation.utils";
  import type { SnsSummary } from "$lib/types/sns";

  let loading = false;
  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        // TODO: improve loading and use in memory sns neurons or load from backend
        loading = true;
        await syncSnsAccounts(selectedProjectCanisterId);
        loading = false;
      }
    }
  );

  onDestroy(unsubscribe);

  let totalAmountToken: TokenAmount | undefined;
  $: totalAmountToken =
    $snsProjectAccountsStore === undefined
      ? undefined
      : sumTokenAmounts(
          ...$snsProjectAccountsStore.map(({ balance }) => balance)
        );

  const goToDetails = async ({ identifier }: Account) =>
    await goto(
      buildWalletUrl({
        universe: $pageStore.universe,
        account: identifier,
      })
    );

  let summary: SnsSummary | undefined;
  $: summary = $snsProjectSelectedStore?.summary;

  let logo: string;
  $: logo = summary?.metadata.logo;

  let name: string;
  $: name = summary?.metadata.name;
</script>

<AccountsTitle balance={totalAmountToken} {logo} title={name} />

<div class="card-grid" data-tid="sns-accounts-body">
  {#if loading}
    <SkeletonCard />
  {:else}
    {#each $snsProjectAccountsStore ?? [] as account}
      <AccountCard
        role="link"
        on:click={() => goToDetails(account)}
        hash
        {account}>{account.name ?? $i18n.accounts.main}</AccountCard
      >
    {/each}
  {/if}
</div>
