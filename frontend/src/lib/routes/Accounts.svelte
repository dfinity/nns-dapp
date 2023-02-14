<script lang="ts">
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import {
    isCkBTCUniverseStore,
    isNnsUniverseStore,
    selectedUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
  import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";
  import { uncertifiedLoadSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
  import {
    snsProjectsCommittedStore,
    type SnsFullProject,
  } from "$lib/derived/sns/sns-projects.derived";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { isUniverseCkBTC } from "$lib/utils/universe.utils";
  import { uncertifiedLoadCkBTCAccountsBalance } from "$lib/services/ckbtc-accounts-balance.services";
  import CkBTCAccounts from "$lib/pages/CkBTCAccounts.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import type { Account } from "$lib/types/account";
  import { goto } from "$app/navigation";
  import { buildWalletUrl } from "$lib/utils/navigation.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import CkBTCAccountsFooter from "$lib/components/accounts/CkBTCAccountsFooter.svelte";
  import { ENABLE_CKBTC_LEDGER } from "$lib/stores/feature-flags.store";

  // Selected project ID on mount is excluded from load accounts balances. See documentation.
  let selectedUniverseId = $selectedUniverseIdStore;

  let loadSnsAccountsBalancesRequested = false;
  let loadCkBTCAccountsBalancesRequested = false;

  const loadSnsAccountsBalances = async (
    projects: SnsFullProject[] | undefined
  ) => {
    // We start when the projects are fetched
    if (isNullish(projects) || projects.length === 0) {
      return;
    }

    // We trigger the loading of the Sns Accounts Balances only once
    if (loadSnsAccountsBalancesRequested) {
      return;
    }

    loadSnsAccountsBalancesRequested = true;

    await uncertifiedLoadSnsAccountsBalances({
      rootCanisterIds: projects.map(({ rootCanisterId }) => rootCanisterId),
      excludeRootCanisterIds: [selectedUniverseId.toText()],
    });
  };

  const loadCkBTCAccountsBalances = async () => {
    // ckBTC is not enabled, information shall and cannot be fetched
    if (!$ENABLE_CKBTC_LEDGER) {
      return;
    }

    // We load the accounts balance of ckBTC only if the current <Accounts /> is loaded in a view where ckBTC is not the selected universe
    // - if user is navigating to route/accounts with Nns or Sns universe, then we load the balance
    // - if user is navigating to route/accounts with ckBTC universe, then we do not load the balance here but let the main <CkBTCACcounts /> load the accounts with query+update
    if (isUniverseCkBTC(selectedUniverseId)) {
      return;
    }

    // We trigger the loading of the ckBTC Accounts Balances only once
    if (loadCkBTCAccountsBalancesRequested) {
      return;
    }

    loadCkBTCAccountsBalancesRequested = true;

    await uncertifiedLoadCkBTCAccountsBalance();
  };

  $: (async () =>
    await Promise.allSettled([
      loadSnsAccountsBalances($snsProjectsCommittedStore),
      loadCkBTCAccountsBalances(),
    ]))();

  const goToWallet = async ({ identifier }: Account) =>
    await goto(
      buildWalletUrl({
        universe: $pageStore.universe,
        account: identifier,
      })
    );
</script>

<main>
  <SummaryUniverse />

  {#if $isNnsUniverseStore}
    <NnsAccounts {goToWallet} />
  {:else if $isCkBTCUniverseStore}
    <CkBTCAccounts {goToWallet} />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsAccounts {goToWallet} />
  {/if}
</main>

{#if $isNnsUniverseStore}
  <NnsAccountsFooter />
{:else if $isCkBTCUniverseStore}
  <CkBTCAccountsFooter />
{:else if nonNullish($snsProjectSelectedStore)}
  <SnsAccountsFooter />
{/if}

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
