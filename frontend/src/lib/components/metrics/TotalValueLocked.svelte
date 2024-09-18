<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { metricsStore } from "$lib/stores/metrics.store";
  import { nonNullish } from "@dfinity/utils";

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
<a
  class="tvl"
  class:visible={nonNullish(total) && total > 0 && nonNullish(formattedTotal)}
  class:stacked={layout === "stacked"}
  data-tid="total-value-locked-component"
  href="https://dashboard.internetcomputer.org/neurons"
  target="_blank"
  rel="noopener noreferrer"
>
  <span>{$i18n.metrics.tvl}</span>
  <span data-tid="tvl-metric" class="total">{formattedTotal}</span>
</a>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .tvl {
    display: inline-block;
    text-decoration: none;
    text-align: center;

    gap: var(--padding-0_5x);
    z-index: var(--z-index);

    @include fonts.small;
    color: var(--text-color);

    background: var(--sidebar-button-background);
    border-radius: var(--border-radius);

    &:hover {
      background: var(--sidebar-button-background-hover);
    }

    padding: var(--padding) var(--padding-2x);

    &.stacked {
      display: flex;
      flex-direction: column-reverse;
      gap: var(--padding-0_5x);

      .total {
        @include fonts.h5(false);
      }
    }
  }
</style>
