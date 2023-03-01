<script lang="ts">
  import { Toasts } from "@dfinity/gix-components";
  import { metricsStore } from "$lib/stores/metrics.store";
  import { toastsHide, toastsShow } from "$lib/stores/toasts.store";
  import { IconMeter, toastsStore } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import type { ToastMsg } from "$lib/types/toast";
  import { i18n } from "$lib/stores/i18n";

  let toastId: symbol | undefined;

  const transactionRateWarning = (transactionRate: number) => {
    if (transactionRate <= 0) {
      return;
    }

    // Display only one warning toast.
    if (
      nonNullish(toastId) &&
      $toastsStore.filter(({ id }: ToastMsg) => id === toastId) !== undefined
    ) {
      // If transaction rate is lower threshold we can close existing toast.
      if (transactionRate < 50) {
        toastsHide(toastId);
        toastId = undefined;
      }

      return;
    }

    toastId = Symbol("warn-transaction-rate");

    toastsShow({
      id: toastId,
      labelKey: "metrics.thanks_fun",
      level: "info",
      position: "top-end",
      title: $i18n.metrics.nns_high_load,
      truncate: true,
      icon: IconMeter,
    });
  };

  $: $metricsStore,
    (() => {
      const transactionRate =
        $metricsStore?.transactionRate?.message_execution_rate[0]?.[1] ?? 0;
      transactionRateWarning(transactionRate);
    })();
</script>

<Toasts position="top-end" />
