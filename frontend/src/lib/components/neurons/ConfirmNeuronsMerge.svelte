<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "$lib/constants/neurons.constants";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { mergeNeurons } from "$lib/services/neurons.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { valueSpan } from "$lib/utils/utils";
  import { Html, busy } from "@dfinity/gix-components";

  export let neurons: NeuronInfo[];

  const dispatcher = createEventDispatcher();
  $: {
    // Only MAX_NEURONS_MERGED neurons can be merged
    if (neurons.length !== MAX_NEURONS_MERGED) {
      toastsError({
        labelKey: "error.unexpected_number_neurons_merge",
      });
      dispatcher("nnsClose");
    }
  }

  const merge = async () => {
    startBusyNeuron({
      initiator: "merge-neurons",
      neuronId: neurons[0].neuronId,
    });
    // We know that neurons has 2 neurons.
    // We have a check above that closes the modal if not.
    const id = await mergeNeurons({
      targetNeuronId: neurons[0].neuronId,
      sourceNeuronId: neurons[1].neuronId,
    });

    if (id !== undefined) {
      toastsSuccess({
        labelKey: "neuron_detail.merge_neurons_success",
      });
    }

    dispatcher("nnsClose");
    stopBusy("merge-neurons");
  };

  const sectionTitleMapper = [
    $i18n.neurons.merge_neurons_modal_title_2,
    $i18n.neurons.merge_neurons_modal_with,
  ];
</script>

<div class="wrapper">
  {#each neurons as neuron, index}
    <h3>{sectionTitleMapper[index]}</h3>

    <div>
      <p class="label">{$i18n.neurons.neuron_id}</p>
      <p class="value">{neuron.neuronId}</p>
    </div>

    <div>
      <p class="label">{$i18n.neurons.neuron_balance}</p>
      <p>
        <Html
          text={replacePlaceholders($i18n.neurons.amount_icp_stake, {
            $amount: valueSpan(
              formatToken({ value: neuronStake(neuron), detailed: true })
            ),
          })}
        />
      </p>
    </div>
  {/each}

  <p class="additional-text description">
    {$i18n.neurons.irreversible_action}
  </p>

  <div class="toolbar">
    <button class="secondary" on:click={() => dispatcher("nnsBack")}>
      {$i18n.neurons.merge_neurons_edit_selection}
    </button>
    <button
      class="primary"
      data-tid="confirm-merge-neurons-button"
      disabled={$busy}
      on:click={merge}
    >
      {$i18n.neurons.merge_neurons_modal_confirm}
    </button>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  h3 {
    margin: 0;
    line-height: var(--line-height-standard);
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .additional-text {
    width: 100%;
    text-align: center;

    @include media.min-width(medium) {
      text-align: right;
    }
  }
</style>
