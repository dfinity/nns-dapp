<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { InputRange, KeyValuePair } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let formattedMaturity: string;
  export let percentage: number;
  export let buttonText: string;
  export let disabled = false;

  const dispatcher = createEventDispatcher();
  const selectPercentage = () => dispatcher("nnsSelectPercentage");
</script>

<KeyValuePair>
  <span slot="key" class="label">{$i18n.neuron_detail.available_maturity}</span>
  <span class="value" slot="value">{formattedMaturity}</span>
</KeyValuePair>

<slot name="description" />

<p class="label"><slot name="text" /></p>

<div class="select-container">
  <InputRange
    ariaLabel={$i18n.neuron_detail.maturity_range}
    min={0}
    max={100}
    bind:value={percentage}
  />
  <h5>
    {formatPercentage(percentage / 100, {
      minFraction: 0,
      maxFraction: 0,
    })}
  </h5>
</div>

<div class="toolbar">
  <button class="secondary" on:click={() => dispatcher("nnsCancel")}>
    {$i18n.core.cancel}
  </button>
  <button
    data-tid="select-maturity-percentage-button"
    class="primary"
    on:click={selectPercentage}
    {disabled}
  >
    {buttonText}
  </button>
</div>

<style lang="scss">
  .label {
    padding-top: var(--padding-3x);
  }

  .select-container {
    width: 100%;

    h5 {
      margin-top: var(--padding);
      text-align: center;
    }
  }
</style>
