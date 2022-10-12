<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "$lib/constants/neurons.constants";
  import FooterModal from "$lib/modals/FooterModal.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { mergeNeurons } from "$lib/services/neurons.services";
  import { busy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import { valueSpan } from "$lib/utils/utils";

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
  <div>
    {#each neurons as neuron, index}
      <div class="main-info">
        <h3>{sectionTitleMapper[index]}</h3>
      </div>
      <div>
        <p class="label">{$i18n.neurons.neuron_id}</p>
        <p class="value">{neuron.neuronId}</p>
      </div>
      <div>
        <p class="label">{$i18n.neurons.neuron_balance}</p>
        <p>
          {@html replacePlaceholders($i18n.neurons.icp_stake, {
            $amount: valueSpan(
              formatToken({ value: neuronStake(neuron), detailed: true })
            ),
          })}
        </p>
      </div>
    {/each}
  </div>
  <div>
    <FooterModal>
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
    </FooterModal>
    <p class="additional-text">
      {$i18n.neurons.irreversible_action}
    </p>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  .wrapper {
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);
  }

  .main-info {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .additional-text {
    width: 100%;
    margin-top: var(--padding-2x);
    text-align: center;

    @include media.min-width(medium) {
      text-align: right;
    }
  }
</style>
