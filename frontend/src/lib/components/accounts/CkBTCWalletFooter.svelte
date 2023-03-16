<script lang="ts">
  import { isNullish, nonNullish } from "@dfinity/utils";
  import {
    WALLET_CONTEXT_KEY,
    type CkBTCWalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { getBTCAddress } from "$lib/services/ckbtc-minter.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { emit } from "$lib/utils/events.utils";
  import Footer from "$lib/components/layout/Footer.svelte";
  import type { CkBTCWalletModal } from "$lib/types/ckbtc-accounts.modal";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import CkBTCReceive from "$lib/components/accounts/CkBTCReceive.svelte";

  const context: CkBTCWalletContext =
    getContext<CkBTCWalletContext>(WALLET_CONTEXT_KEY);
  const { store, reloadAccount, reloadAccountFromStore }: CkBTCWalletContext =
    context;

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  const openSend = () => {
    // Button is disabled if no account anyway
    if (isNullish($store.account)) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_no_account",
      });
      return;
    }

    // Button is disabled if no universe anyway
    if (isNullish($selectedCkBTCUniverseIdStore) || isNullish(canisters)) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_no_universe",
      });
      return;
    }

    emit<CkBTCWalletModal>({
      message: "nnsCkBTCAccountsModal",
      detail: {
        type: "ckbtc-wallet-transaction",
        data: {
          account: $store.account,
          reloadAccountFromStore,
          universeId: $selectedCkBTCUniverseIdStore,
          canisters,
        },
      },
    });
  };

  let disableButton = true;
  $: disableButton =
    isNullish($store.account) ||
    isNullish($selectedCkBTCUniverseIdStore) ||
    isNullish(canisters);
  $busy;
</script>

<Footer columns={2}>
  <button
    class="primary"
    on:click={openSend}
    disabled={disableButton}
    data-tid="open-new-ckbtc-transaction">{$i18n.accounts.send}</button
  >

  <CkBTCReceive account={$store.account} {reloadAccount} />
</Footer>
