<script lang="ts">
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/utils";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";
  import { KeyValuePairInfo } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { snsNeuronVotingPower } from "$lib/utils/sns-neuron.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import SnsNeuronVotingPowerExplanation from "./SnsNeuronVotingPowerExplanation.svelte";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let token: Token;

  let votingPower: number;
  $: votingPower = snsNeuronVotingPower({
    neuron,
    snsParameters: parameters,
  });
</script>

<TestIdWrapper testId="sns-voting-power-component">
  <KeyValuePairInfo testId="sns-voting-power">
    <span class="label" slot="key">{$i18n.neurons.voting_power}</span>
    <span class="value" slot="value">
      {formatVotingPower(votingPower)}
    </span>
    <svelte:fragment slot="info">
      <SnsNeuronVotingPowerExplanation {neuron} {parameters} {token} />
    </svelte:fragment>
  </KeyValuePairInfo>
</TestIdWrapper>
