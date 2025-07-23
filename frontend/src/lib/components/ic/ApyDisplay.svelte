<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import type { ApyAmount } from "$lib/types/staking";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";

  type Props = {
    apy?: ApyAmount;
    isLoading?: boolean;
  };

  const { apy, isLoading }: Props = $props();
</script>

<div class="apy" data-tid="apy-display-component">
  {#if nonNullish(apy) && isNullish(apy?.error)}
    <span
      >{formatPercentage(apy.cur, {
        minFraction: 2,
        maxFraction: 2,
      })}</span
    >
    <span class="max cell-with-tooltip"
      >({formatPercentage(apy.max, {
        minFraction: 2,
        maxFraction: 2,
      })})
      {#if apy.max === 0}
        <TooltipIcon
          iconSize={16}
          text={$i18n.portfolio.apy_card_tooltip_no_rewards}
        />
      {/if}
    </span>
  {:else if nonNullish(apy?.error) && !isLoading}
    <span class="cell-with-tooltip">
      {PRICE_NOT_AVAILABLE_PLACEHOLDER}
      <TooltipIcon
        iconSize={16}
        text={$i18n.portfolio.apy_card_tooltip_error}
      />
    </span>
  {:else if isLoading}
    <span class="cell skeleton"></span>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .apy {
    display: flex;
    gap: var(--padding-0_5x);
    font-size: 0.875rem;
    color: var(--text-description);

    @include media.min-width(medium) {
      font-size: var(--font-size-standard);
      flex-direction: column;
      gap: 0;
      color: var(--text-primary);
    }

    .max {
      color: var(--text-description);

      @include media.min-width(medium) {
        font-size: 0.875rem;
      }
    }
  }
</style>
