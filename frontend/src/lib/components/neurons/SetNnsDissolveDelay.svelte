<script lang="ts">
  import {
    SECONDS_IN_EIGHT_YEARS,
    SECONDS_IN_HALF_YEAR,
  } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import {
    neuronStake as getNeuronStake,
    neuronPotentialVotingPower,
  } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";

  import SetDissolveDelay from "$lib/components/neurons/SetDissolveDelay.svelte";
  import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

  export let delayInSeconds: number;
  export let neuron: NeuronInfo;

  let neuronStake: TokenAmountV2;
  $: neuronStake = TokenAmountV2.fromUlps({
    amount: getNeuronStake(neuron),
    token: ICPToken,
  });
  const calculateVotingPower = (delayInSeconds: number) =>
    Number(
      neuronPotentialVotingPower({
        neuron,
        newDissolveDelayInSeconds: BigInt(Math.round(delayInSeconds)),
      })
    );
</script>

<SetDissolveDelay
  bind:delayInSeconds
  on:nnsCancel
  on:nnsConfirmDelay
  neuronState={neuron.state}
  neuronDissolveDelaySeconds={neuron.dissolveDelaySeconds}
  {neuronStake}
  minProjectDelayInSeconds={SECONDS_IN_HALF_YEAR}
  maxDelayInSeconds={SECONDS_IN_EIGHT_YEARS}
  {calculateVotingPower}
  minDissolveDelayDescription={$i18n.neurons.min_dissolve_delay_description}
>
  <p slot="neuron-id" class="value">{neuron.neuronId}</p>
  <slot name="cancel" slot="cancel" />
  <slot name="confirm" slot="confirm" />
</SetDissolveDelay>
