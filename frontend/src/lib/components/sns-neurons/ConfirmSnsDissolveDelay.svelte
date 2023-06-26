<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { valueSpan } from "$lib/utils/utils";
  import { Html, busy } from "@dfinity/gix-components";
  import {
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/utils";
  import type { SnsNervousSystemParameters } from "@dfinity/sns";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { snsParametersStore } from "$lib/stores/sns-parameters.store";
  import type { Principal } from "@dfinity/principal";

  export let rootCanisterId: Principal;
  export let neuron: SnsNeuron;
  export let token: Token;
  export let delayInSeconds: number;

  const dispatcher = createEventDispatcher();

  let neuronStake: bigint;
  $: neuronStake = getSnsNeuronStake(neuron);

  let neuronId: string;
  $: neuronId = getSnsNeuronIdAsHexString(neuron);

  let snsParameters: SnsNervousSystemParameters | undefined;
  $: snsParameters = $snsParametersStore[rootCanisterId.toText()]?.parameters;

  let votingPower: number | undefined;
  $: if (neuron !== undefined && snsParameters !== undefined) {
    votingPower = snsNeuronVotingPower({
      newDissolveDelayInSeconds: BigInt(delayInSeconds),
      neuron,
      snsParameters,
    });
  }
</script>

<div class="wrapper" data-tid="confirm-dissolve-delay-container">
  <div class="main-info">
    <h3>{secondsToDuration(BigInt(delayInSeconds))}</h3>
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <Hash id="neuron-id" tagName="p" testId="neuron-id" text={neuronId} />
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p>
      <Html
        text={replacePlaceholders($i18n.sns_neurons.token_stake, {
          $amount: valueSpan(
            formatToken({ value: neuronStake, detailed: true })
          ),
          $token: token.symbol,
        })}
      />
    </p>
  </div>
  <div class="voting-power">
    <p class="label">{$i18n.neurons.voting_power}</p>
    <p class="value">
      {#if votingPower !== undefined}
        {formatVotingPower(votingPower)}
      {/if}
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
      on:click={() => dispatcher("nnsConfirm")}
    >
      {$i18n.neurons.confirm_update_delay}
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
