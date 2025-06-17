<script lang="ts">
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { updateDelay } from "$lib/services/neurons.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import {
    formatVotingPower,
    neuronPotentialVotingPower,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import { valueSpan } from "$lib/utils/utils";
  import { Html, busy } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { secondsToDuration } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  type Props = {
    delayInSeconds: bigint;
    neuron: NeuronInfo;
    confirmButtonText: string;
  };
  const { delayInSeconds, neuron, confirmButtonText }: Props = $props();

  const neuronICP = $derived(neuronStake(neuron));

  const dispatcher = createEventDispatcher();

  const updateNeuron = async () => {
    startBusyNeuron({ initiator: "update-delay", neuronId: neuron.neuronId });

    const neuronId = await updateDelay({
      neuronId: neuron.neuronId,
      dissolveDelayInSeconds: Number(
        delayInSeconds - neuron.dissolveDelaySeconds
      ),
    });

    stopBusy("update-delay");

    if (neuronId !== undefined) {
      dispatcher("nnsUpdated");
    }
  };
</script>

<div class="wrapper" data-tid="confirm-dissolve-delay-container">
  <div class="main-info">
    <h3>{secondsToDuration({ seconds: delayInSeconds, i18n: $i18n.time })}</h3>
  </div>
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
            formatTokenE8s({ value: neuronICP, detailed: true })
          ),
        })}
      />
    </p>
  </div>
  <div class="voting-power">
    <p class="label">{$i18n.neurons.voting_power}</p>
    <p class="value">
      {formatVotingPower(
        neuronPotentialVotingPower({
          neuron,
          newDissolveDelayInSeconds: delayInSeconds,
        })
      )}
    </p>
  </div>
  <div class="toolbar">
    <button
      class="secondary"
      disabled={$busy}
      onclick={() => dispatcher("nnsBack")}
    >
      {$i18n.neurons.edit_delay}
    </button>
    <button
      class="primary"
      data-tid="confirm-delay-button"
      disabled={$busy}
      onclick={updateNeuron}
    >
      {confirmButtonText}
    </button>
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

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
