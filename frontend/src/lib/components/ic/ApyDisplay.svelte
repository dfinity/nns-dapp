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
    forPortfolio?: boolean;
  };

  const { apy, isLoading, forPortfolio = true }: Props = $props();
</script>

<div class="apy" class:forPortfolio data-tid="apy-display-component">
  {#if nonNullish(apy) && isNullish(apy?.error)}
    <span data-tid="apy-current-value"
      >{formatPercentage(apy.cur, {
        minFraction: 2,
        maxFraction: 2,
      })}</span
    >
    <span class="max cell-with-tooltip" data-tid="apy-max-value">
      ({formatPercentage(apy.max, {
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
    <span class="cell skeleton" data-tid="is-loading"></span>
  {:else}
    <span data-tid="placeholder">{PRICE_NOT_AVAILABLE_PLACEHOLDER}</span>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  %standard-current-value {
    gap: 0;
    font-size: var(--font-size-standard);
    flex-direction: column;
    color: var(--text-primary);
  }

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

    .cell.skeleton {
      height: 20px;
      width: 80px;
      border-radius: 4px;
    }

    .cell-with-tooltip {
      display: flex;
      align-items: center;
      gap: var(--padding-0_5x);
    }

    &:not(.forPortfolio) {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
      align-items: flex-end;

      // Set mobile font sizes for staking/neuron tables
      font-size: var(--font-size-standard);
      flex-direction: column;
      color: var(--text-primary);
      .max {
        font-size: var(--font-size-small);
      }
    }
  }
</style>
