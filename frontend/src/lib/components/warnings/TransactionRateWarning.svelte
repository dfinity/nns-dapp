<script lang="ts">
  import { metricsStore } from "$lib/stores/metrics.store";
  import { toastsHide, toastsShow } from "$lib/stores/toasts.store";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD } from "$lib/constants/warnings.constants";
  import TransactionRateWarningIcon from "$lib/components/warnings/TransactionRateWarningIcon.svelte";
  import { layoutWarningToastId } from "$lib/stores/layout.store";

  const transactionRateWarning = () => {
    const transactionRate =
      $metricsStore?.transactionRate?.message_execution_rate[0]?.[1];

    if (isNullish(transactionRate)) {
      return;
    }

    // Display only one warning toast or do not display again a toast if user has manually closed the warning
    if (nonNullish($layoutWarningToastId)) {
      // If new transaction rate is lower threshold we reset the warning.
      if (transactionRate < WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD) {
        toastsHide($layoutWarningToastId);
        layoutWarningToastId.set(undefined);
      }

      return;
    }

    // There was no toast displayed but, is the subnet under high load?
    if (transactionRate < WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD) {
      return;
    }

    layoutWarningToastId.set(Symbol("warn-transaction-rate"));

    toastsShow({
      id: $layoutWarningToastId,
      labelKey: "metrics.thanks_fun",
      level: "custom",
      position: "top",
      title: $i18n.metrics.nns_high_load,
      overflow: "truncate",
      icon: TransactionRateWarningIcon,
      theme: "inverted",
    });
  };

  $: $metricsStore, (() => transactionRateWarning())();
</script>

<!-- display transaction rate warnings -->
