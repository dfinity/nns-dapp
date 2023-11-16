<script lang="ts">
  import { goto } from "$app/navigation";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import Tokens from "$lib/pages/Tokens.svelte";
  import SignInTokens from "$lib/pages/SignInTokens.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import { onMount } from "svelte";
  import type { Action } from "$lib/types/actions";
  import { tokensListVisitorsStore } from "$lib/derived/tokens-list-visitors.derived";
  import { login } from "$lib/services/auth.services";
  import { loadCkBTCTokens } from "$lib/services/ckbtc-tokens.services";
  import { tokensListUserStore } from "$lib/derived/tokens-list-user.derived";
  import {
    snsProjectsCommittedStore,
    type SnsFullProject,
  } from "$lib/derived/sns/sns-projects.derived";
  import { uncertifiedLoadSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
  import type { Universe } from "$lib/types/universe";
  import { isArrayEmpty } from "$lib/utils/utils";
  import { uncertifiedLoadCkBTCAccountsBalance } from "$lib/services/ckbtc-accounts-balance.services";
  import { ckBTCUniversesStore } from "$lib/derived/ckbtc-universes.derived";

  onMount(() => {
    if (!$ENABLE_MY_TOKENS) {
      goto(AppPath.Accounts);
    }
    loadCkBTCTokens();
  });

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
      excludeRootCanisterIds: [],
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
      excludeUniverseIds: [],
    });
  };

  $: (async () => {
    if ($authSignedInStore) {
      await Promise.allSettled([
        loadSnsAccountsBalances($snsProjectsCommittedStore),
        loadCkBTCAccountsBalances($ckBTCUniversesStore),
      ]);
    }
  })();

  const handleAction = ({ detail: _ }: { detail: Action }) => {
    // Any action from non-signed in user should be trigger a login
    if (!$authSignedInStore) {
      login();
    }
  };
</script>

<TestIdWrapper testId="tokens-route-component">
  {#if $authSignedInStore}
    <Tokens userTokensData={$tokensListUserStore} on:nnsAction={handleAction} />
  {:else}
    <SignInTokens
      on:nnsAction={handleAction}
      userTokensData={$tokensListVisitorsStore}
    />
  {/if}
</TestIdWrapper>
