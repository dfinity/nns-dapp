<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { formatVotingPower, votingPower } from "$lib/utils/neuron.utils";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { valueSpan } from "$lib/utils/utils";
  import { Html, busy } from "@dfinity/gix-components";
  import {
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
  } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Principal } from "@dfinity/principal";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { assertNonNullish } from "@dfinity/utils";
  import { updateDelay } from "$lib/services/sns-neurons.services";
  import { SELECTED_SNS_NEURON_CONTEXT_KEY } from "$lib/types/sns-neuron-detail.context";

  export let delayInSeconds: number;
  export let neuron: SnsNeuron;
  export let confirmButtonText: string;

  const dispatcher = createEventDispatcher();
  const { reload: reloadNeuron } = getContext(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuronStake: bigint;
  $: neuronStake = getSnsNeuronStake(neuron);

  let neuronId: string;
  neuronId = getSnsNeuronIdAsHexString(neuron);

  const updateNeuron = async () => {
    startBusy({
      initiator: "dissolve-sns-action",
    });

    let rootCanisterId: Principal | undefined = $snsOnlyProjectStore;

    assertNonNullish(rootCanisterId);

    const { success } = await updateDelay({
      rootCanisterId,
      neuron,
      dissolveDelaySeconds: delayInSeconds,
    });

    await Promise.all([reloadNeuron()]);

    stopBusy("dissolve-sns-action");

    if (success) {
      dispatcher("nnsUpdated");
    }
  };
</script>

<div class="wrapper" data-tid="confirm-dissolve-delay-container">
  <div class="main-info">
    <h3>{secondsToDuration(BigInt(delayInSeconds))}</h3>
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <p class="value">{neuronId}</p>
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p>
      <Html
        text={replacePlaceholders($i18n.neurons.icp_stake, {
          $amount: valueSpan(
            formatToken({ value: neuronStake, detailed: true })
          ),
        })}
      />
    </p>
  </div>
  <div class="voting-power">
    <p class="label">{$i18n.neurons.voting_power}</p>
    <p class="value">
      {formatVotingPower(
        votingPower({
          stake: neuronStake,
          dissolveDelayInSeconds: delayInSeconds,
        })
      )}
    </p>
  </div>
  <div class="toolbar">
    <button
      class="secondary"
      disabled={$busy}
      on:click={() => dispatcher("nnsBack")}
    >
      {$i18n.neurons.edit_delay}
    </button>
    <button
      class="primary"
      data-tid="confirm-delay-button"
      disabled={$busy}
      on:click={updateNeuron}
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
