<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { MAX_NEURONS_MERGED } from "../../constants/neurons.constants";
  import FooterModal from "../../modals/FooterModal.svelte";
  import { startBusyNeuron } from "../../services/busy.services";
  import { mergeNeurons } from "../../services/neurons.services";
  import { busy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import { neuronStake } from "../../utils/neuron.utils";
  import { valueSpan } from "../../utils/utils";

  export let neurons: NeuronInfo[];

  const dispatcher = createEventDispatcher();
  $: {
    // Only MAX_NEURONS_MERGED neurons can be merged
    if (neurons.length !== MAX_NEURONS_MERGED) {
      toastsStore.error({
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
      toastsStore.success({
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
        <h5>{$i18n.neurons.neuron_id}</h5>
        <p class="value">{neuron.neuronId}</p>
      </div>
      <div>
        <h5>{$i18n.neurons.neuron_balance}</h5>
        <p>
          {@html replacePlaceholders($i18n.neurons.icp_stake, {
            $amount: valueSpan(
              formatICP({ value: neuronStake(neuron), detailed: true })
            ),
          })}
        </p>
      </div>
    {/each}
  </div>
  <div>
    <FooterModal>
      <button class="secondary small" on:click={() => dispatcher("nnsBack")}>
        {$i18n.neurons.merge_neurons_edit_selection}
      </button>
      <button
        class="primary small"
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
  @use "../../themes/mixins/media";
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
