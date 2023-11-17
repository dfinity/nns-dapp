<script lang="ts">
  import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
  import NnsAccountsFooter from "$lib/components/accounts/NnsAccountsFooter.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
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
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import { uncertifiedLoadCkBTCAccountsBalance } from "$lib/services/ckbtc-accounts-balance.services";
  import CkBTCAccounts from "$lib/pages/CkBTCAccounts.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import CkBTCAccountsFooter from "$lib/components/accounts/CkBTCAccountsFooter.svelte";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";
  import type { Universe } from "$lib/types/universe";
  import { isArrayEmpty } from "$lib/utils/utils";
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";
  import { UserTokenAction, type UserTokenData } from "$lib/types/tokens-page";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";

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

    await uncertifiedLoadCkBTCAccountsBalance({
      universeIds: universes.map(({ canisterId }) => canisterId),
      excludeUniverseIds: [selectedUniverseId.toText()],
    });
  };

  $: (async () =>
    await Promise.allSettled([
      loadSnsAccountsBalances($snsProjectsCommittedStore),
      loadCkBTCAccountsBalances($ckBTCUniversesStore),
    ]))();

  // TODO: Use derived store https://dfinity.atlassian.net/browse/GIX-2083
  const data: UserTokenData[] = [
    {
      universeId: OWN_CANISTER_ID,
      title: "Main",
      balance: TokenAmount.fromE8s({
        amount: 314000000n,
        token: NNS_TOKEN_DATA,
      }),
      logo: IC_LOGO_ROUNDED,
      actions: [UserTokenAction.Send, UserTokenAction.Receive],
    },
  ];
</script>

<TestIdWrapper testId="accounts-component">
  <main>
    <SummaryUniverse />

    {#if $isNnsUniverseStore}
      <NnsAccounts userTokensData={data} />
    {:else if $isCkBTCUniverseStore}
      <CkBTCAccounts />
    {:else if nonNullish($snsProjectSelectedStore)}
      <SnsAccounts />
    {/if}
  </main>

  {#if $isNnsUniverseStore}
    <NnsAccountsFooter />
  {:else if $isCkBTCUniverseStore}
    <CkBTCAccountsFooter />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsAccountsFooter />
  {/if}
</TestIdWrapper>

{#if $isCkBTCUniverseStore}
  <CkBTCAccountsModals />
{:else}
  <AccountsModals />
{/if}

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }
</style>
