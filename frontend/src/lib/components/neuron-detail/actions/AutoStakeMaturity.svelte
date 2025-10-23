<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Checkbox, Tooltip } from "@dfinity/gix-components";

  type Props = {
    hasAutoStakeOn: boolean;
    disabled?: boolean;
  };

  let { hasAutoStakeOn = $bindable(), disabled = false }: Props = $props();
</script>

{#snippet checkbox()}
  <Checkbox
    preventDefault
    testId="auto-stake-maturity-checkbox-component"
    inputId="auto-stake-maturity-checkbox"
    checked={hasAutoStakeOn}
    on:nnsChange
    {disabled}
    --checkbox-label-order="1"
  >
    <span>{$i18n.neuron_detail.auto_stake_maturity}</span>
  </Checkbox>
{/snippet}

{#if disabled}
  <Tooltip
    testId="auto-stake-maturity-tooltip"
    idPrefix="auto-stake-maturity-tooltip"
    text={$i18n.neuron_detail.auto_stake_maturity_tooltip}
  >
    {@render checkbox()}
  </Tooltip>
{:else}
  {@render checkbox()}
{/if}
