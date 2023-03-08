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
  import type { CkBTCWalletModal } from "$lib/types/wallet.modal";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";

  const context: CkBTCWalletContext =
    getContext<CkBTCWalletContext>(WALLET_CONTEXT_KEY);
  const { store, reloadAccount, reloadAccountFromStore }: CkBTCWalletContext =
    context;

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  const openReceive = async () => {
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

    // TODO: to be removed when ckBTC with minter is live.
    // Remove displayBtcAddress at the same time.
    if (!isUniverseCkTESTBTC($selectedCkBTCUniverseIdStore)) {
      emit<CkBTCWalletModal>({
        message: "ckBTCWalletModal",
        detail: {
          type: "ckbtc-receive",
          data: {
            displayBtcAddress: false,
            btcAddress: "",
            account: $store.account,
            reloadAccount,
            universeId: $selectedCkBTCUniverseIdStore,
            canisters,
          },
        },
      });
      return;
    }

    startBusy({
      initiator: "get-btc-address",
    });

    try {
      // TODO(GIX-1303): ckBTC - derive the address in frontend. side note: should we keep track of the address in a store?
      const btcAddress = await getBTCAddress(canisters.minterCanisterId);

      emit<CkBTCWalletModal>({
        message: "ckBTCWalletModal",
        detail: {
          type: "ckbtc-receive",
          data: {
            displayBtcAddress: true,
            btcAddress,
            account: $store.account,
            reloadAccount,
            universeId: $selectedCkBTCUniverseIdStore,
            canisters,
          },
        },
      });
    } catch (err: unknown) {
      toastsError({
        labelKey: "error__ckbtc.get_btc_address",
        err,
      });
    }

    stopBusy("get-btc-address");
  };

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
      message: "ckBTCWalletModal",
      detail: {
        type: "ckbtc-transaction",
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

  <button
    class="secondary"
    on:click={openReceive}
    disabled={disableButton}
    data-tid="receive-ckbtc-transaction">{$i18n.ckbtc.receive}</button
  >
</Footer>
