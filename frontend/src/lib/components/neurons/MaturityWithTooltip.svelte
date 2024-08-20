<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";

  export let availableMaturity: bigint;
  export let stakedMaturity: bigint;
  let totalMaturity = availableMaturity + stakedMaturity;

  const formatMaturityForTable = (maturity: bigint) => {
    const formattedMaturity = formatTokenE8s({
      value: maturity,
      extraDetailForSmallAmount: false,
    });
    return formattedMaturity == "0.00" ? "0" : formattedMaturity;
  };
</script>

<div data-tid="maturity-with-tooltip-component" class="container">
  <span data-tid="total-maturity">
    {formatMaturityForTable(totalMaturity)}
  </span>
  <TooltipIcon tooltipIdPrefix="maturity-cell-tooltip">
    <div class="tooltip-content">
      <div class="maturity-row">
        <div class="maturity-label">
          {$i18n.neuron_detail.available_description}
        </div>
        <div class="maturity-value" data-tid="available-maturity">
          {formatMaturity(availableMaturity)}
        </div>
      </div>
      <Separator spacing="none" />
      <div class="maturity-row">
        <div class="maturity-label">
          {$i18n.neuron_detail.staked_description}
        </div>
        <div class="maturity-value" data-tid="staked-maturity">
          {formatMaturity(stakedMaturity)}
        </div>
      </div>
    </div>
  </TooltipIcon>
</div>

<style lang="scss">
  .container {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
  }

  .tooltip-content {
    --elements-divider: var(--tooltip-divider);
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);

    .maturity-row {
      display: flex;
      gap: var(--padding-2x);
      justify-content: space-between;

      .maturity-label {
        color: var(--tooltip-description-color);
      }
    }
  }
</style>
