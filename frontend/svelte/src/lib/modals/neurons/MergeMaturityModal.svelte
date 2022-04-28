<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import Modal from "../Modal.svelte";
  import { maturityByStake, neuronStake } from "../../utils/neuron.utils";
  import { formatPercentage } from "../../utils/format.utils";
  import Card from "../../components/ui/Card.svelte";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import InputRange from "../../components/ui/InputRange.svelte";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { mergeMaturity } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import { createEventDispatcher } from "svelte";
  import Spinner from "../../components/ui/Spinner.svelte";

  export let neuron: NeuronInfo;

  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  let percentageToMerge: number = 0;
  let loading: boolean;

  const dispatcher = createEventDispatcher();
  const mergeNeuronMaturity = async () => {
    loading = true;
    startBusy("merge-maturity");
    const { success } = await mergeMaturity({
      neuronId: neuron.neuronId,
      percentageToMerge,
    });
    if (success) {
      toastsStore.success({
        labelKey: "neuron_detail.merge_maturity_success",
      });
      dispatcher("nnsClose");
    }
    loading = false;
    stopBusy("merge-maturity");
  };
</script>

<Modal theme="dark" size="medium" on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.neuron_detail.merge_maturity_modal_title}</svelte:fragment
  >
  <section data-tid="merge-maturity-neuron-modal">
    <div>
      <h5>{$i18n.neuron_detail.current_maturity}</h5>
      <p>{formatPercentage(maturityByStake(neuron))}</p>
    </div>
    <div>
      <h5>{$i18n.neuron_detail.current_stake}</h5>
      <p data-tid="neuron-stake">
        {replacePlaceholders($i18n.neurons.icp_stake, {
          $amount: formatICP(neuronICP),
        })}
      </p>
    </div>

    <Card>
      <div slot="start">
        <h5>{$i18n.neuron_detail.merge_maturity_modal_title}</h5>
        <p>{$i18n.neuron_detail.merge_maturity_modal_description}</p>
      </div>
      <div class="select-container">
        <InputRange min={0} max={100} bind:value={percentageToMerge} />
        <div class="details">
          <h5>
            {formatPercentage(percentageToMerge / 100, {
              minFraction: 0,
              maxFraction: 0,
            })}
          </h5>
        </div>
      </div>
    </Card>

    <button
      data-tid="merge-maturity-button"
      class="primary full-width"
      on:click={mergeNeuronMaturity}
      disabled={loading}
    >
      {#if loading}
        <Spinner />
      {:else}
        {$i18n.core.confirm}
      {/if}
    </button>
  </section>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  section {
    @include modal.section;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);
    margin-top: calc(4 * var(--padding));
  }

  .select-container {
    width: 100%;

    .details {
      margin-top: var(--padding);
      display: flex;
      justify-content: space-around;
    }
  }
</style>
