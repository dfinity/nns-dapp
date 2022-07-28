<script lang="ts">
  import { ICP, type NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import {
    formattedMaturityByStake,
    isEnoughToStakeNeuron,
    neuronStake,
  } from "../../utils/neuron.utils";
  import { valueSpan } from "../../utils/utils";

  export let neuron: NeuronInfo;

  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  let disabled: boolean;
  $: disabled = !isEnoughToStakeNeuron({
    stake: ICP.fromE8s(neuron.fullNeuron?.maturityE8sEquivalent ?? BigInt(0)),
  });

  const dispatcher = createEventDispatcher();
  const confirm = () => {
    dispatcher("nnsConfirm");
  };
</script>

<div class="wrapper" data-tid="confirm-spawn-hw-screen">
  <div class="info-wrapper">
    <div>
      <h5>{$i18n.neuron_detail.current_maturity}</h5>
      <p>
        {formattedMaturityByStake(neuron)}
      </p>
      <h5>{$i18n.neuron_detail.current_stake}</h5>
      <p data-tid="neuron-stake">
        {@html replacePlaceholders($i18n.neurons.icp_stake, {
          $amount: valueSpan(formatICP({ value: neuronICP, detailed: true })),
        })}
      </p>
    </div>
    <div>
      <p>
        {@html $i18n.neuron_detail.spawn_maturity_explanation_1}
      </p>
      <p>
        {@html $i18n.neuron_detail.spawn_maturity_explanation_2}
      </p>
    </div>
    <p>
      {@html $i18n.neuron_detail.spawn_maturity_note_hw}
    </p>
  </div>
  <button
    data-tid="confirm-spawn-button"
    class="primary full-width"
    on:click={confirm}
    {disabled}
  >
    {$i18n.neuron_detail.spawn}
  </button>
</div>

<style lang="scss">
  .wrapper {
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);

    .info-wrapper {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--padding-3x);
    }

    // For the link inside "i18n.neuron_detail.spawn_maturity_explanation_hw"
    :global(a) {
      color: var(--primary);
      text-decoration: none;
      font-size: inherit;
      line-height: inherit;
    }
  }
</style>
