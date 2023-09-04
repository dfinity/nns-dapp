<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let enoughMaturity: boolean;
</script>

<TestIdWrapper testId="disburse-maturity-button-component">
  {#if enoughMaturity}
    <button class="secondary" on:click
      >{$i18n.neuron_detail.disburse_maturity}</button
    >
  {:else}
    <Tooltip
      id="stake-maturity-tooltip"
      text={$i18n.neuron_detail.disburse_maturity_disabled_tooltip}
    >
      <button class="secondary" disabled
        >{$i18n.neuron_detail.disburse_maturity}</button
      >
    </Tooltip>
  {/if}
</TestIdWrapper>
