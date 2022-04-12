<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import { toastsStore } from "../../stores/toasts.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import { neuronStake } from "../../utils/neuron.utils";
  import Spinner from "../ui/Spinner.svelte";

  export let neurons: NeuronInfo[];

  const dispatcher = createEventDispatcher();
  $: {
    if (neurons.length !== 2) {
      toastsStore.error({
        labelKey: "error.unexpected_number_neurons_merge",
      });
      dispatcher("nnsClose");
    }
  }

  let loading: boolean = false;

  const mergeNeurons = () => {
    // TODO: Implement Functionality in next PR
    console.log("Merging");
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
        <p>{neuron.neuronId}</p>
      </div>
      <div>
        <h5>{$i18n.neurons.neuron_balance}</h5>
        <p>
          {replacePlaceholders($i18n.neurons.icp_stake, {
            $amount: formatICP(neuronStake(neuron)),
          })}
        </p>
      </div>
    {/each}
  </div>
  <div>
    <button
      class="primary full-width"
      data-tid="confirm-merge-neurons-button"
      on:click={mergeNeurons}
    >
      {#if loading}
        <Spinner />
      {:else}
        {$i18n.neurons.merge_neurons_modal_confirm}
      {/if}
    </button>
  </div>
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

  .main-info {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
