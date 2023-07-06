<script lang="ts">
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/utils";
  import { Html } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import {
    ageMultiplier,
    dissolveDelayMultiplier,
    formattedStakedMaturity,
    getSnsNeuronStake,
  } from "$lib/utils/sns-neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;
  export let token: Token;

  // If the neuron has voting power percentage multiplier of 100
  // the voting power calculation matches the calculation for NNS neurons
  let votingPowerMessage: string;
  $: votingPowerMessage =
    neuron.voting_power_percentage_multiplier === 100n
      ? $i18n.neuron_detail.voting_power_tooltip_with_stake
      : $i18n.sns_neuron_detail.voting_power_tooltip_with_stake;
</script>

<TestIdWrapper testId="sns-neuron-voting-power-explanation-component">
  <Html
    text={replacePlaceholders(votingPowerMessage, {
      $token: token.symbol,
      $stake: formatToken({
        value: getSnsNeuronStake(neuron),
        detailed: true,
      }),
      $st4kedMaturity: formattedStakedMaturity(neuron),
      $delayMultiplier: dissolveDelayMultiplier({
        neuron,
        snsParameters: parameters,
      }).toFixed(2),
      $ageMultiplier: ageMultiplier({
        neuron,
        snsParameters: parameters,
      }).toFixed(2),
      $votingPowerMultiplier: (
        Number(neuron.voting_power_percentage_multiplier) / 100
      ).toFixed(2),
    })}
  />
</TestIdWrapper>
