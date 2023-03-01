<script lang="ts">
  import { IconMeter } from "@dfinity/gix-components";
  import { metricsStore } from "$lib/stores/metrics.store";
  import { WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD } from "$lib/constants/warnings.constants";

  let transactionRate: number;
  $: transactionRate =
    $metricsStore?.transactionRate?.message_execution_rate[0]?.[1] ?? 0;

  let high = false;
  $: high = transactionRate >= WARNING_TRANSACTIONS_PER_SECONDS_HIGH_LOAD;
</script>

<div class:high>
  <IconMeter />
</div>

<style lang="scss">
  .high {
    --meter-rotate: 70deg;
  }
</style>