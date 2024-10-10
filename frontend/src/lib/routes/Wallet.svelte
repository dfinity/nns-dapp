<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import {
    isCkBTCUniverseStore,
    isIcrcTokenUniverseStore,
    isNnsUniverseStore,
  } from "$lib/derived/selected-universe.derived";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import AccountsModals from "$lib/modals/accounts/AccountsModals.svelte";
  import CkBTCAccountsModals from "$lib/modals/accounts/CkBTCAccountsModals.svelte";
  import IcrcTokenAccountsModals from "$lib/modals/accounts/IcrcTokenAccountsModals.svelte";
  import CkBTCWallet from "$lib/pages/CkBTCWallet.svelte";
  import IcrcWallet from "$lib/pages/IcrcWallet.svelte";
  import NnsWallet from "$lib/pages/NnsWallet.svelte";
  import SnsWallet from "$lib/pages/SnsWallet.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { nonNullish, isNullish } from "@dfinity/utils";
  import { AppPath } from "$lib/constants/routes.constants";
  import { goto } from "$app/navigation";
  import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
  import { importedTokensStore } from "$lib/stores/imported-tokens.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  export let accountIdentifier: string | undefined | null = undefined;

  layoutTitleStore.set({
    title: $i18n.wallet.title,
  });

  const redirectIfUnknownToken = () => {
    if (
      !$isNnsUniverseStore &&
      !$isCkBTCUniverseStore &&
      !$isIcrcTokenUniverseStore &&
      isNullish($snsProjectSelectedStore)
    ) {
      // When we can't determine the token type, rather than making guesses,
      // it’s more reliable to navigate the user to the all tokens page.
      // (imported tokens are not available when signed out).
      goto(AppPath.Tokens);
    }
  };
  let tokensReady = false;
  $: tokensReady ||=
    // We can't be sure that the token is unknown
    // before we have the list of Sns projects.
    // and imported tokens being loaded
    nonNullish($snsAggregatorStore.data) &&
    (!$authSignedInStore || nonNullish($importedTokensStore.importedTokens));
  $: if (tokensReady) {
    // We only need to check this once per page load,
    // as the main goal is to navigate after signing out from the imported token page.
    redirectIfUnknownToken();
  }
</script>

<TestIdWrapper testId="wallet-component">
  {#if $isNnsUniverseStore}
    <NnsWallet {accountIdentifier} />
  {:else if $isCkBTCUniverseStore}
    <CkBTCWallet {accountIdentifier} />
  {:else if $isIcrcTokenUniverseStore}
    <IcrcWallet {accountIdentifier} />
  {:else if nonNullish($snsProjectSelectedStore)}
    <SnsWallet {accountIdentifier} />
  {/if}

  {#if $isCkBTCUniverseStore}
    <CkBTCAccountsModals />
  {:else}
    <IcrcTokenAccountsModals />
    <AccountsModals />
  {/if}
</TestIdWrapper>
