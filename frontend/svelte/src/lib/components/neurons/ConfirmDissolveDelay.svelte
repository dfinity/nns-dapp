<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { updateDelay } from "../../services/neurons.services";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import { votingPower } from "../../utils/neuron.utils";

  export let delayInSeconds: number;
  export let neuron: NeuronInfo | undefined;
  let loading: boolean = false;

  const dispatcher = createEventDispatcher();
  let neuronICP: bigint;
  $: neuronICP = neuron?.fullNeuron?.cachedNeuronStake ?? BigInt(0);

  const updateNeuron = async () => {
    if (neuron === undefined) {
      // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-329
      console.error("Neuron is not defined");
      return;
    }

    loading = true;
    try {
      await updateDelay({
        neuronId: neuron.neuronId,
        dissolveDelayInSeconds: delayInSeconds,
      });
      dispatcher("nnsNext");
    } catch (error) {
      // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-329
      console.error(error);
    } finally {
      loading = false;
    }
  };
</script>

<div class="wizard-wrapper" data-tid="confirm-dissolve-delay-container">
  {#if neuron !== undefined}
    <div class="main-info">
      <h3>{secondsToDuration(BigInt(delayInSeconds))}</h3>
    </div>
    <div>
      <h5>{$i18n.neurons.neuron_id}</h5>
      <p>{neuron.neuronId}</p>
    </div>
    <div>
      <h5>{$i18n.neurons.neuron_balance}</h5>
      <p>
        {replacePlaceholders($i18n.neurons.icp_stake, {
          $amount: formatICP(neuronICP),
        })}
      </p>
    </div>
    <div class="voting-power">
      <h5>{$i18n.neurons.voting_power}</h5>
      <p>
        {votingPower({
          stake: neuronICP,
          dissolveDelayInSeconds: delayInSeconds,
        }).toFixed(2)}
      </p>
    </div>
    <div>
      <button
        class="primary full-width"
        data-tid="confirm-delay-button"
        disabled={loading}
        on:click={updateNeuron}
      >
        {#if loading}
          <Spinner />
        {:else}
          {$i18n.neurons.confirm_delay}
        {/if}
      </button>
    </div>
  {:else}
    <Spinner />
  {/if}
</div>

<style lang="scss">
  .main-info {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: calc(3 * var(--padding));
  }

  .voting-power {
    flex-grow: 1;
  }
</style>
