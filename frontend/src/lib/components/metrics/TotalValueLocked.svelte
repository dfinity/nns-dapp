<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";
  import { metricsStore } from "$lib/stores/metrics.store";

  export let layout: "inline" | "stacked" = "inline";

  let total: number | undefined;
  $: total = Number($metricsStore?.tvl?.tvl ?? "0");

  let currency = "USD";
  $: currency = Object.keys($metricsStore?.tvl?.currency ?? {})[0] ?? "USD";

  // We do not use common `formatNumber` utils here because of the unique particularity of the display used nowhere else in the dapp
  let formattedTotal: string | undefined = undefined;
  $: formattedTotal = nonNullish(total)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        maximumSignificantDigits: 7,
      })
        .format(total)
        .replace(/,/g, "’")
    : undefined;
</script>

<!-- DO NOT use a Svelte transition. It caused issues with navigation -->
<div
  class="tvl"
  class:visible={nonNullish(total) && total > 0 && nonNullish(formattedTotal)}
  class:stacked={layout === "stacked"}
  data-tid="total-value-locked-component"
>
  <span>{$i18n.metrics.tvl}</span>
  <span data-tid="tvl-metric" class="total">>{formattedTotal}</span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .tvl {
    display: inline-block;

    visibility: hidden;
    opacity: 0;
    transition: opacity ease-out var(--animation-time-normal);

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
