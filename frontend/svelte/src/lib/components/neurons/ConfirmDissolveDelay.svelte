<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import Spinner from "../ui/Spinner.svelte";
  import { updateDelay } from "../../services/neurons.services";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { formatICP } from "../../utils/icp.utils";
  import {
    formatVotingPower,
    neuronStake,
    votingPower,
  } from "../../utils/neuron.utils";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { toastsStore } from "../../stores/toasts.store";

  export let delayInSeconds: number;
  export let neuron: NeuronInfo;
  let loading: boolean = false;

  const dispatcher = createEventDispatcher();
  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  const updateNeuron = async () => {
    startBusy("update-delay");
    loading = true;
    const neuronId = await updateDelay({
      neuronId: neuron.neuronId,
      dissolveDelayInSeconds:
        delayInSeconds - Number(neuron.dissolveDelaySeconds),
    });
    stopBusy("update-delay");
    loading = false;
    if (neuronId !== undefined) {
      dispatcher("nnsUpdated");
      toastsStore.show({
        labelKey: "neurons.dissolve_delay_success",
        level: "info",
      });
    }
  };
</script>

<div class="wizard-wrapper" data-tid="confirm-dissolve-delay-container">
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
      {formatVotingPower(
        votingPower({
          stake: neuronICP,
          dissolveDelayInSeconds: delayInSeconds,
        })
      )}
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
</div>

<style lang="scss">
  .main-info {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--padding-3x);
  }

  .voting-power {
    flex-grow: 1;
  }
</style>
