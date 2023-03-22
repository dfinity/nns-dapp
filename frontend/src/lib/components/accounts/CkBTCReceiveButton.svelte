<script lang="ts">
  import { isNullish } from "@dfinity/utils";
  import { toastsError } from "$lib/stores/toasts.store";
  import { selectedCkBTCUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";
  import { emit } from "$lib/utils/events.utils";
  import type { CkBTCWalletModal } from "$lib/types/ckbtc-accounts.modal";
  import { i18n } from "$lib/stores/i18n";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import type { Account } from "$lib/types/account";

  export let account: Account | undefined = undefined;
  export let reload: (() => Promise<void>) | undefined = undefined;
  export let canSelectAccount = false;
  export let disableButton: boolean;
  export let canisters: CkBTCAdditionalCanisters | undefined;

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
            account,
            reload,
            universeId: $selectedCkBTCUniverseIdStore,
            canisters,
            canSelectAccount,
          },
        },
      });
      return;
    }

    emit<CkBTCWalletModal>({
      message: "nnsCkBTCAccountsModal",
      detail: {
        type: "ckbtc-receive",
        data: {
          displayBtcAddress: true,
          account,
          reload,
          universeId: $selectedCkBTCUniverseIdStore,
          canisters,
          canSelectAccount,
        },
      },
    });
  };
</script>

<button
  class="secondary"
  disabled={disableButton}
  on:click={openReceive}
  data-tid="receive-ckbtc">{$i18n.ckbtc.receive}</button
>
