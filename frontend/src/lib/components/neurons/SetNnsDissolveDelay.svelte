<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    SECONDS_IN_EIGHT_YEARS,
    SECONDS_IN_HALF_YEAR,
  } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import {
    neuronStake as getNeuronStake,
    neuronVotingPower,
  } from "$lib/utils/neuron.utils";

  import SetDissolveDelay from "$lib/components/neurons/SetDissolveDelay.svelte";
  import { ICPToken, TokenAmount } from "@dfinity/nns";

  export let delayInSeconds: number;
  export let neuron: NeuronInfo;
  export let cancelButtonText: string;
  export let confirmButtonText: string;

  let neuronStake: TokenAmount;
  $: neuronStake = TokenAmount.fromE8s({
    amount: getNeuronStake(neuron),
    token: ICPToken,
  });
  const calculateVotingPower = (delayInSeconds: number) =>
    neuronVotingPower({
      neuron,
      newDissolveDelayInSeconds: BigInt(delayInSeconds),
    });
</script>

<SetDissolveDelay
  bind:delayInSeconds
  on:nnsCancel
  on:nnsConfirmDelay
  neuronIdText={`${neuron.neuronId}`}
  neuronState={neuron.state}
  neuronDissolveDelaySeconds={neuron.dissolveDelaySeconds}
  {neuronStake}
  minProjectDelayInSeconds={SECONDS_IN_HALF_YEAR}
  maxDelayInSeconds={SECONDS_IN_EIGHT_YEARS}
  minDelayInSeconds={Number(neuron.dissolveDelaySeconds)}
  {cancelButtonText}
  {confirmButtonText}
  {calculateVotingPower}
  minDissolveDelayDescription={$i18n.neurons.dissolve_delay_description}
/>
