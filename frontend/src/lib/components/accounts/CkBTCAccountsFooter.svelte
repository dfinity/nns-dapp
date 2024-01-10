<script lang="ts">
  import Footer from "$lib/components/layout/Footer.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import { hasAccounts } from "$lib/utils/accounts.utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import { busy } from "@dfinity/gix-components";
  import CkBTCReceiveButton from "$lib/components/accounts/CkBTCReceiveButton.svelte";
  import CkBTCSendButton from "$lib/components/accounts/CkBTCSendButton.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { syncAccounts } from "$lib/services/wallet-accounts.services";

  let canMakeTransactions = false;
  $: canMakeTransactions =
    nonNullish($selectedCkBTCUniverseIdStore) &&
    hasAccounts(
      $icrcAccountsStore[$selectedCkBTCUniverseIdStore.toText()]?.accounts ?? []
    ) &&
    nonNullish($ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore.toText()]) &&
    nonNullish($ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]);

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  const reload = async () => {
    if (isNullish($selectedCkBTCUniverseIdStore)) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_no_universe",
      });
      return;
    }

    await syncAccounts({ universeId: $selectedCkBTCUniverseIdStore });
  };
</script>

{#if canMakeTransactions}
  <Footer>
    <CkBTCSendButton disableButton={$busy} {canisters} />
    <CkBTCReceiveButton
      canSelectAccount
      disableButton={$busy}
      {canisters}
      {reload}
    />
  </Footer>
{/if}
