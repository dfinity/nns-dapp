<script lang="ts">
  import {
    NNS_MAXIMUM_DISSOLVE_DELAY,
    NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE,
  } from "$lib/constants/neurons.constants";
  import { i18n } from "$lib/stores/i18n";
  import {
    neuronStake as getNeuronStake,
    neuronPotentialVotingPower,
  } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";

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
  minProjectDelayInSeconds={NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE}
  maxDelayInSeconds={NNS_MAXIMUM_DISSOLVE_DELAY}
  {calculateVotingPower}
  minDissolveDelayDescription={$i18n.neurons.min_dissolve_delay_description}
>
  <p slot="neuron-id" class="value">{neuron.neuronId}</p>
  <slot name="cancel" slot="cancel" />
  <slot name="confirm" slot="confirm" />
</SetDissolveDelay>
