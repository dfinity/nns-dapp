<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { isNullish } from "@dfinity/utils";

  // If the button is disabled, this will be the tooltip text.
  export let disabledText: string | undefined = undefined;
</script>

<TestIdWrapper testId="disburse-maturity-button-component">
  {#if isNullish(disabledText)}
    <button class="secondary" on:click
      >{$i18n.neuron_detail.disburse_maturity}</button
    >
  {:else}
    <Tooltip id="stake-maturity-tooltip" text={disabledText}>
      <button class="secondary" disabled
        >{$i18n.neuron_detail.disburse_maturity}</button
      >
    </Tooltip>
  {/if}
</TestIdWrapper>
