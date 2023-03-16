<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Footer from "$lib/components/layout/Footer.svelte";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import { hasAccounts } from "$lib/utils/accounts.utils";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import type { TokenAmount } from "@dfinity/nns";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import { emit } from "$lib/utils/events.utils";
  import type { CkBTCWalletModal } from "$lib/types/ckbtc-accounts.modal";
  import { busy } from "@dfinity/gix-components";
  import CkBTCReceive from "$lib/components/accounts/CkBTCReceive.svelte";

  let canMakeTransactions = false;
  $: canMakeTransactions =
    nonNullish($selectedCkBTCUniverseIdStore) &&
    hasAccounts(
      $icrcAccountsStore[$selectedCkBTCUniverseIdStore.toText()]?.accounts ?? []
    ) &&
    nonNullish($ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore.toText()]) &&
    nonNullish($ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]);

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenStore[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let transactionFee: TokenAmount | undefined = undefined;
  $: transactionFee = nonNullish($selectedCkBTCUniverseIdStore)
    ? $ckBTCTokenFeeStore[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  const openSend = () => {
    if (
      isNullish(canisters) ||
      isNullish($selectedCkBTCUniverseIdStore) ||
      isNullish(token) ||
      isNullish(transactionFee)
    ) {
      // Button is disabled if any of those condition are not met
      return;
    }

    emit<CkBTCWalletModal>({
      message: "nnsCkBTCAccountsModal",
      detail: {
        type: "ckbtc-transaction",
        data: {
          account: undefined,
          universeId: $selectedCkBTCUniverseIdStore,
          canisters,
          reloadAccountFromStore: undefined,
          loadTransactions: false
        },
      },
    });
  };
</script>

{#if canMakeTransactions}
  <Footer columns={2}>
    <button
      class="primary full-width"
      on:click={openSend}
      disabled={$busy}
      data-tid="open-ckbtc-transaction">{$i18n.accounts.send}</button
    >

    <CkBTCReceive canSelectAccount disableButton={$busy} {canisters} />
  </Footer>
{/if}
