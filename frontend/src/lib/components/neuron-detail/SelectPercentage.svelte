<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    formattedMaturity,
    neuronStake,
  } from "../../utils/neuron.utils";
  import { formatPercentage } from "../../utils/format.utils";
  import Card from "../ui/Card.svelte";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import InputRange from "../ui/InputRange.svelte";
  import { createEventDispatcher } from "svelte";
  import FooterModal from "../../modals/FooterModal.svelte";

  export let neuron: NeuronInfo;
  export let percentage: number;
  export let buttonText: string;
  export let disabled: boolean = false;

  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  const dispatcher = createEventDispatcher();
  const selectPercentage = async () => {
    dispatcher("nnsSelectPercentage");
  };
</script>

<div class="wrapper" data-tid="spawn-maturity-neuron-modal">
  <div>
    <h5>{$i18n.neuron_detail.current_maturity}</h5>
    <p>
      {formattedMaturity(neuron)}
    </p>
    <h5>{$i18n.neuron_detail.current_stake}</h5>
    <p data-tid="neuron-stake">
      {replacePlaceholders($i18n.neurons.icp_stake, {
        $amount: formatICP({ value: neuronICP, detailed: true }),
      })}
    </p>
  </div>
  <slot name="description" />

  <Card>
    <div slot="start">
      <slot name="text" />
    </div>
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
  </Card>

  <FooterModal>
    <button class="secondary small" on:click={() => dispatcher("nnsBack")}>
      {$i18n.core.cancel}
    </button>
    <button
      data-tid="select-maturity-percentage-button"
      class="primary small"
      on:click={selectPercentage}
      {disabled}
    >
      {buttonText}
    </button>
  </FooterModal>
</div>

<style lang="scss">
  .wrapper {
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);
  }

  .select-container {
    width: 100%;

    h5 {
      margin-top: var(--padding);
      text-align: center;
    }
  }
</style>
