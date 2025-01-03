<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import {
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import { formatTokenE8s } from "$lib/utils/token.utils";
  import { valueSpan } from "$lib/utils/utils";
  import { Html, busy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { secondsToDuration, type Token } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

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
    <h3 data-tid="dissolve-delay">
      {secondsToDuration({ seconds: BigInt(delayInSeconds), i18n: $i18n.time })}
    </h3>
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <Hash id="neuron-id" tagName="p" testId="neuron-id" text={neuronId} />
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="neuron-stake">
      <Html
        text={replacePlaceholders($i18n.sns_neurons.token_stake, {
          $amount: valueSpan(
            formatTokenE8s({ value: neuronStake, detailed: true })
          ),
          $token: token.symbol,
        })}
      />
    </p>
  </div>
  <div class="voting-power">
    <p class="label">{$i18n.neurons.voting_power}</p>
    <p class="value" data-tid="voting-power">
      {#if votingPower !== undefined}
        {formatVotingPower(votingPower)}
      {/if}
    </p>
  </div>
  <div class="toolbar">
    <button
      data-tid="edit-delay-button"
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
