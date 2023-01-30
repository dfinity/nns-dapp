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
  import { isNullish, nonNullish } from "$lib/utils/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { isUniverseCkBTC } from "$lib/utils/universe.utils";
  import { uncertifiedLoadCkBTCAccountsBalance } from "$lib/services/ckbtc-accounts-balance.services";
  import CkBTCAccounts from "$lib/pages/CkBTCAccounts.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";

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
</script>

<main>
  <SummaryUniverse />

  {#if $isNnsUniverseStore}
    <NnsAccounts />
  {:else if $isCkBTCUniverseStore}
    <CkBTCAccounts />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsAccounts />
  {/if}
</main>

{#if $isNnsUniverseStore}
  <NnsAccountsFooter />
{:else if nonNullish($snsProjectSelectedStore)}
  <SnsAccountsFooter />
{/if}

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
