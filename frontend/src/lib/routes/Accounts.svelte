<script lang="ts">
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import {
    isCkBTCUniverseStore,
    isIcrcTokenUniverseStore,
    isNnsUniverseStore,
    selectedIcrcTokenUniverseIdStore,
    selectedUniverseIdStore,
  } from "$lib/derived/selected-universe.derived";
  import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
  import SnsAccountsFooter from "$lib/components/accounts/SnsAccountsFooter.svelte";
  import { uncertifiedLoadSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
  import {
    snsProjectsCommittedStore,
    type SnsFullProject,
  } from "$lib/derived/sns/sns-projects.derived";
  import { nonNullish } from "@dfinity/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { uncertifiedLoadAccountsBalance } from "$lib/services/wallet-uncertified-accounts.services";
  import CkBTCAccounts from "$lib/pages/CkBTCAccounts.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import CkBTCAccountsFooter from "$lib/components/accounts/CkBTCAccountsFooter.svelte";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import type { Universe } from "$lib/types/universe";
  import { isArrayEmpty } from "$lib/utils/utils";
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";
  import { icpTokensListUser } from "$lib/derived/icp-tokens-list-user.derived";
  import {
    icrcCanistersStore,
    type IcrcCanistersStoreData,
  } from "$lib/stores/icrc-canisters.store";
  import { loadIcrcAccounts } from "$lib/services/icrc-accounts.services";
  import IcrcTokenAccounts from "$lib/pages/IcrcTokenAccounts.svelte";
  import IcrcTokenAccountsFooter from "$lib/components/accounts/IcrcTokenAccountsFooter.svelte";
  import IcrcTokenAccountsModals from "$lib/modals/accounts/IcrcTokenAccountsModals.svelte";

  // TODO: This component is mounted twice. Understand why and fix it.

  // Selected project ID on mount is excluded from load accounts balances. See documentation.
  let selectedUniverseId = $selectedUniverseIdStore;

  let loadSnsAccountsBalancesRequested = false;
  let loadCkBTCAccountsBalancesRequested = false;

  const loadSnsAccountsBalances = async (projects: SnsFullProject[]) => {
    // We start when the projects are fetched
    if (projects.length === 0) {
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

  const loadCkBTCAccountsBalances = async (universes: Universe[]) => {
    // ckBTC is not enabled, information shall and cannot be fetched
    if (isArrayEmpty(universes)) {
      return;
    }

    // We trigger the loading of the ckBTC Accounts Balances only once
    if (loadCkBTCAccountsBalancesRequested) {
      return;
    }

    loadCkBTCAccountsBalancesRequested = true;

    await uncertifiedLoadAccountsBalance({
      universeIds: universes.map(({ canisterId }) => canisterId),
      excludeUniverseIds: [selectedUniverseId.toText()],
    });
  };

  const loadIcrcTokenAccounts = (
    icrcCanisters: IcrcCanistersStoreData
  ): Promise<void> => {
    const ledgerCanisterIds = Object.values(icrcCanisters).map(
      ({ ledgerCanisterId }) => ledgerCanisterId
    );

    return loadIcrcAccounts({ ledgerCanisterIds, certified: false });
  };

  $: (async () =>
    await Promise.allSettled([
      loadSnsAccountsBalances($snsProjectsCommittedStore),
      loadCkBTCAccountsBalances($ckBTCUniversesStore),
      loadIcrcTokenAccounts($icrcCanistersStore),
    ]))();
</script>

<TestIdWrapper testId="accounts-component">
  <main>
    <SummaryUniverse />

    {#if $isNnsUniverseStore}
      <NnsAccounts userTokensData={$icpTokensListUser} />
    {:else if $isCkBTCUniverseStore}
      <CkBTCAccounts />
    {:else if $isIcrcTokenUniverseStore}
      <IcrcTokenAccounts />
    {:else if nonNullish($snsProjectSelectedStore)}
      <SnsAccounts />
    {/if}
  </main>

  {#if $isNnsUniverseStore}
    <NnsAccountsFooter />
  {:else if $isCkBTCUniverseStore}
    <CkBTCAccountsFooter />
  {:else if $isIcrcTokenUniverseStore}
    <IcrcTokenAccountsFooter />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsAccountsFooter />
  {/if}

  {#if $isCkBTCUniverseStore}
    <CkBTCAccountsModals />
  {:else if $selectedIcrcTokenUniverseIdStore}
    <IcrcTokenAccountsModals />
  {:else}
    <AccountsModals />
  {/if}
</TestIdWrapper>

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
