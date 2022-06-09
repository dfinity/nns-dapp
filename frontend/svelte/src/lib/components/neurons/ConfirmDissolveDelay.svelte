<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
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
  import { busy, stopBusy } from "../../stores/busy.store";
  import { startBusyNeuron } from "../../services/busy.services";

  export let delayInSeconds: number;
  export let neuron: NeuronInfo;
  export let confirmButtonText: string;

  const dispatcher = createEventDispatcher();
  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  const updateNeuron = async () => {
    startBusyNeuron({ initiator: "update-delay", neuronId: neuron.neuronId });

    const neuronId = await updateDelay({
      neuronId: neuron.neuronId,
      dissolveDelayInSeconds:
        delayInSeconds - Number(neuron.dissolveDelaySeconds),
    });

    stopBusy("update-delay");

    if (neuronId !== undefined) {
      dispatcher("nnsUpdated");
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
        $amount: formatICP({ value: neuronICP, detailed: true }),
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
      disabled={$busy}
      on:click={updateNeuron}
    >
      {confirmButtonText}
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
