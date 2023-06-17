<script lang="ts">
  import { bitcoinConvertBlockIndexes } from "$lib/stores/bitcoin.store";
  import { isArrayEmpty } from "$lib/utils/utils";
  import { toastsShow } from "$lib/stores/toasts.store";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  const showWarning = () => {
    // Display a warning only if signed in
    if (!$authSignedInStore) {
      return;
    }

    if (isArrayEmpty($bitcoinConvertBlockIndexes)) {
      return;
    }

    toastsShow({
      labelKey: "ckbtc.warning_transaction_description",
      level: "error",
      position: "top",
      title: $i18n.ckbtc.warning_transaction_failed,
      overflow: "clamp",
      theme: "inverted",
    });

    // For simplicity reason we display once the warning message and empty the list at the same time.
    // The toast is displayed until the user closes it anyway.
    bitcoinConvertBlockIndexes.reset();
  };

  $: $authStore.identity, showWarning();
</script>

<!-- display unfinished convert ckBTC to Btc warnings -->
