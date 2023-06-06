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
  import { Html, busy } from "@dfinity/gix-components";
  import NnsNeuronInfo from "./NnsNeuronInfo.svelte";

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

  let targetNeuron: NeuronInfo;
  let sourceNeuron: NeuronInfo;
  $: [sourceNeuron, targetNeuron] = neurons;

  const merge = async () => {
    startBusyNeuron({
      initiator: "merge-neurons",
      neuronId: sourceNeuron.neuronId,
    });
    // We know that neurons has 2 neurons.
    // We have a check above that closes the modal if not.
    const id = await mergeNeurons({
      targetNeuronId: targetNeuron.neuronId,
      sourceNeuronId: sourceNeuron.neuronId,
    });

    if (id !== undefined) {
      toastsSuccess({
        labelKey: "neuron_detail.merge_neurons_success",
      });
    }

    dispatcher("nnsClose");
    stopBusy("merge-neurons");
  };
</script>

<div class="wrapper" data-tid="confirm-neurons-merge-component">
  <h3>{$i18n.neurons.merge_neurons_modal_title_2}</h3>

  <NnsNeuronInfo neuron={sourceNeuron} testId="source-neuron-info" />

  <h3>{$i18n.neurons.merge_neurons_modal_into}</h3>

  <NnsNeuronInfo neuron={targetNeuron} testId="target-neuron-info" />

  <div class="additional-text">
    <p class="description">
      <Html
        text={replacePlaceholders(
          $i18n.neurons.merge_neurons_source_neuron_disappear,
          {
            $neuronId: String(sourceNeuron.neuronId),
          }
        )}
      />
    </p>

    <p class="description">
      <Html text={$i18n.neurons.merge_neurons_more_info} />
    </p>

    <p class="description">
      {$i18n.neurons.irreversible_action}
    </p>
  </div>

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
  @use "@dfinity/gix-components/dist/styles/mixins/media";

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
