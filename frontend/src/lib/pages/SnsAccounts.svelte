<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import AccountsTitle from "../components/accounts/AccountsTitle.svelte";
  import { snsOnlyProjectStore } from "../derived/selected-project.derived";
  import { loadSnsAccounts } from "../services/sns-accounts.services";
  import { snsProjectAccountsStore } from "../derived/sns/sns-project-accounts.derived";
  import AccountCard from "../components/accounts/AccountCard.svelte";
  import { i18n } from "../stores/i18n";
  import type { Account } from "../types/account";
  import { sumTokenAmounts } from "../utils/icp.utils";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";

  let loading: boolean = false;
  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        loading = true;
        await loadSnsAccounts(selectedProjectCanisterId);
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

  // TODO: Wallet details https://dfinity.atlassian.net/browse/GIX-995
  const goToDetails = (account: Account) => {
    console.log("goToDetails", account);
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
