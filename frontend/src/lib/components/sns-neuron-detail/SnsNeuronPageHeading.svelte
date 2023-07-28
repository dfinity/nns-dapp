<script lang="ts">
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { TokenAmount, type Token, nonNullish } from "@dfinity/utils";
  import { tokensStore } from "$lib/stores/tokens.store";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import {
    getSnsNeuronStake,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import PageHeading from "../common/PageHeading.svelte";
  import { formatVotingPower } from "$lib/utils/neuron.utils";

  export let neuron: SnsNeuron;
  export let parameters: SnsNervousSystemParameters;

  let token: Token | undefined;
  $: token = $tokensStore[$selectedUniverseIdStore.toText()].token;

  let amount: TokenAmount | undefined;
  $: amount =
    nonNullish(token) && nonNullish(neuron)
      ? TokenAmount.fromE8s({
          amount: getSnsNeuronStake(neuron),
          token: token,
        })
      : undefined;

  let votingPower: number;
  $: votingPower = snsNeuronVotingPower({ neuron, snsParameters: parameters });
</script>

<PageHeading testId="sns-neuron-page-heading-component">
  <svelte:fragment slot="title">
    {#if nonNullish(amount)}
      <AmountDisplay {amount} size="huge" singleLine />
    {/if}
  </svelte:fragment>
  <span slot="subtitle" data-tid="voting-power">
    {#if votingPower > 0}
      {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
        $votingPower: formatVotingPower(votingPower),
      })}
    {:else}
      {$i18n.neuron_detail.voting_power_zero_subtitle}
    {/if}
  </span>
</PageHeading>
