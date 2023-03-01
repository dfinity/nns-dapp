<script lang="ts">
  import { metricsStore } from "$lib/stores/metrics.store";
  import { toastsHide, toastsShow } from "$lib/stores/toasts.store";
  import { nonNullish } from "@dfinity/utils";
  import { i18n } from "$lib/stores/i18n";
  import { WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD } from "$lib/constants/warnings.constants";
  import TransactionRateWarningIcon from "$lib/components/metrics/TransactionRateWarningIcon.svelte";

  let transactionRate: number;
  $: transactionRate =
    $metricsStore?.transactionRate?.message_execution_rate[0]?.[1] ?? 0;

  let toastId: symbol | undefined;

  const transactionRateWarning = () => {
    // Display only one warning toast or do not display again a toast if user has manually closed the warning
    if (nonNullish(toastId)) {
      // If new transaction rate is lower threshold we reset the warning.
      if (transactionRate < WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD) {
        toastsHide(toastId);
        toastId = undefined;
      }

      return;
    }

    // There was no toast displayed but, is the subnet under high load?
    if (transactionRate < WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD) {
      return;
    }

    toastId = Symbol("warn-transaction-rate");

    toastsShow({
      id: toastId,
      labelKey: "metrics.thanks_fun",
      level: "info",
      position: "top",
      title: $i18n.metrics.nns_high_load,
      truncate: true,
      icon: TransactionRateWarningIcon,
    });
  };

  $: transactionRate, (() => transactionRateWarning())();
</script>

<!-- display transaction rate warnings -->
