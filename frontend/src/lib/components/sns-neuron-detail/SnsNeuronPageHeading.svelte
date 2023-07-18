<script lang="ts">
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import type { SnsNervousSystemParameters, SnsNeuron } from "@dfinity/sns";
  import { TokenAmount, type Token, nonNullish } from "@dfinity/utils";
  import { tokensStore } from "$lib/stores/tokens.store";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import {
    getSnsNeuronStake,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import { formatNumber } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import PageHeading from "../common/PageHeading.svelte";

  export let parameters: SnsNervousSystemParameters;

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null;
  $: neuron = $store.neuron;

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
</script>

<PageHeading testId="sns-neuron-page-heading-component">
  <svelte:fragment slot="title">
    {#if nonNullish(amount)}
      <AmountDisplay {amount} size="huge" singleLine />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="subtitle">
    {#if nonNullish(neuron)}
      {replacePlaceholders($i18n.neuron_detail.voting_power_subtitle, {
        $votingPower: formatNumber(
          snsNeuronVotingPower({ neuron, snsParameters: parameters })
        ),
      })}
    {/if}
  </svelte:fragment>
</PageHeading>
