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
  div {
    animation-duration: calc(2 * var(--animation-time-normal));
    animation-fill-mode: forwards;
    animation-iteration-count: 1;
    animation-name: medium-load;
    animation-timing-function: ease-out;
  }

  .high {
    animation-duration: calc(4 * var(--animation-time-normal));
    animation-name: high-load;
  }

  /* -global- */
  @keyframes -global-medium-load {
    0% {
      --meter-rotate: -70deg;
    }

    15% {
      --meter-rotate: -60deg;
    }

    30% {
      --meter-rotate: -50deg;
    }

    45% {
      --meter-rotate: -40deg;
    }

    60% {
      --meter-rotate: -30deg;
    }

    75% {
      --meter-rotate: -20deg;
    }

    90% {
      --meter-rotate: -10deg;
    }

    100% {
      --meter-rotate: 0deg;
    }
  }

  /* -global- */
  @keyframes -global-high-load {
    0% {
      --meter-rotate: -70deg;
    }

    15% {
      --meter-rotate: -50deg;
    }

    30% {
      --meter-rotate: -30deg;
    }

    45% {
      --meter-rotate: -10deg;
    }

    60% {
      --meter-rotate: 10deg;
    }

    75% {
      --meter-rotate: 30deg;
    }

    90% {
      --meter-rotate: 50deg;
    }

    100% {
      --meter-rotate: 70deg;
    }
  }
</style>
