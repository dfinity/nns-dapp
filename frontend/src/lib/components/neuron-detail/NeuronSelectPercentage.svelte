<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { InputRange, KeyValuePair } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { maturityPercentageToE8s } from "$lib/utils/neuron.utils";
  import { formatMaturity } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let formattedMaturity: string;
  export let percentage: number;
  export let buttonText: string;
  export let disabled = false;

  let maturityE8s: bigint;
  $: maturityE8s = maturityPercentageToE8s({
    percentage,
    total: Number(formattedMaturity),
  });

  const dispatcher = createEventDispatcher();
  const selectPercentage = () => dispatcher("nnsSelectPercentage");
</script>

<TestIdWrapper testId="neuron-select-percentage-component">
  <KeyValuePair>
    <span slot="key" class="label"
      >{$i18n.neuron_detail.available_maturity}</span
    >
    <span class="value" slot="value" data-tid="available-maturity"
      >{formattedMaturity}</span
    >
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
      <span class="description" data-tid="amount-maturity"
        >{replacePlaceholders($i18n.neuron_detail.amount_maturity, {
          $amount: formatMaturity(maturityE8s),
        })}</span
      >
      <span data-tid="percentage-to-disburse"
        >{formatPercentage(percentage / 100, {
          minFraction: 0,
          maxFraction: 0,
        })}</span
      >
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
</TestIdWrapper>

<style lang="scss">
  .label {
    margin: var(--padding-1_5x) 0 var(--padding);
  }

  .select-container {
    width: 100%;

    h5 {
      margin-top: var(--padding);
      text-align: right;
    }
  }
</style>
