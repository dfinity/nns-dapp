<script lang="ts">
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import { emit } from "$lib/utils/events.utils";
  import type { CkBTCWalletModal } from "$lib/types/ckbtc-accounts.modal";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { getBTCAddress } from "$lib/services/ckbtc-minter.services";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
  import type { Account } from "$lib/types/account";

  export let account: Account | undefined = undefined;
  export let reloadAccount: (() => void) | undefined = undefined;
  export let canSelectAccount = false;

  let canisters: CkBTCAdditionalCanisters | undefined = undefined;
  $: canisters = nonNullish($selectedCkBTCUniverseIdStore)
    ? CKBTC_ADDITIONAL_CANISTERS[$selectedCkBTCUniverseIdStore.toText()]
    : undefined;

  const openReceive = async () => {
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
        message: "nnsCkBTCAccountsModal",
        detail: {
          type: "ckbtc-receive",
          data: {
            displayBtcAddress: false,
            btcAddress: "",
            account,
            reloadAccount,
            universeId: $selectedCkBTCUniverseIdStore,
            canisters,
            canSelectAccount,
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
        message: "nnsCkBTCAccountsModal",
        detail: {
          type: "ckbtc-receive",
          data: {
            displayBtcAddress: true,
            btcAddress,
            account,
            reloadAccount,
            universeId: $selectedCkBTCUniverseIdStore,
            canisters,
            canSelectAccount,
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
</script>

<button
  class="secondary"
  disabled={$busy}
  on:click={openReceive}
  data-tid="receive-ckbtc">{$i18n.ckbtc.receive}</button
>
