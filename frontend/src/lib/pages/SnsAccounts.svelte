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
  import { routeStore } from "../stores/route.store";
  import { walletPathStore } from "../derived/paths.derived";
  import { loadSnsTransactionFee } from "../services/transaction-fees.services";

  let loading: boolean = false;
  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        // TODO: improve loading and use in memory sns neurons or load from backend
        loading = true;
        await loadSnsAccounts(selectedProjectCanisterId);
        // No need to wait for the transaction fee
        loadSnsTransactionFee(selectedProjectCanisterId);
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
