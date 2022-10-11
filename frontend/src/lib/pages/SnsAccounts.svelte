<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import AccountsTitle from "$lib/components/accounts/AccountsTitle.svelte";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import AccountCard from "$lib/components/accounts/AccountCard.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { sumTokenAmounts } from "$lib/utils/icp.utils";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { routeStore } from "$lib/stores/route.store";
  import { walletPathStore } from "$lib/derived/paths.derived";

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

  const goToDetails = (account: Account) => {
    routeStore.navigate({ path: `${$walletPathStore}/${account.identifier}` });
  };
</script>

<section data-tid="sns-accounts-body">
  <AccountsTitle balance={totalAmountToken} />
  {#if loading}
    <SkeletonCard />
  {:else}
    {#each $snsProjectAccountsStore ?? [] as account}
      <AccountCard
        role="link"
        on:click={() => goToDetails(account)}
        showCopy
        {account}>{account.name ?? $i18n.accounts.main}</AccountCard
      >
    {/each}
  {/if}
</section>
