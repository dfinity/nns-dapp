<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { fade } from "svelte/transition";
  import { nonNullish } from "@dfinity/utils";
  import { metricsStore } from "$lib/stores/metrics.store";
  import { formatNumber } from "$lib/utils/format.utils";

  export let layout: "inline" | "stacked" = "inline";

  let total: number | undefined;
  $: total = Number($metricsStore?.tvl?.tvl ?? "0");

  const format = (n: number): string =>
    formatNumber(n, {
      minFraction: 0,
      maxFraction: 0,
      maximumSignificantDigits: 7,
    });
</script>

<!-- DO NOT use a Svelte transition. It caused issues with navigation -->
<div
  class="tvl"
  class:visible={nonNullish(total) && total > 0}
  class:stacked={layout === "stacked"}
>
  <span>{$i18n.metrics.tvl}</span>
  <span data-tid="tvl-metric" class="total">${format(total ?? 0)}</span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .tvl {
    display: inline-block;

    visibility: hidden;
    opacity: 0;
    transition: opacity 150ms, visibility 150ms;

    &.visible {
      visibility: visible;
      opacity: 1;
    }

    text-align: center;

    gap: var(--padding-0_5x);
    z-index: var(--z-index);

    @include fonts.small;

    background: rgba(var(--background-disable-rgb), 0.1);
    color: var(--body-color);

    border-radius: var(--border-radius);

    width: 100%;
    padding: var(--padding) var(--padding-2x);

    &.stacked {
      display: flex;
      flex-direction: column-reverse;
      gap: var(--padding-0_5x);

      background: rgba(var(--focus-background-rgb), 0.8);
      color: var(--text2-color);

      .total {
        color: var(--text-color);
        @include fonts.h5(false);
      }
    }
  }

  .total {
    color: var(--menu-select-color);
  }

  @include media.dark-theme {
    .tvl {
      background: rgba(var(--background-disable-rgb), 1);
    }
  }
</style>
