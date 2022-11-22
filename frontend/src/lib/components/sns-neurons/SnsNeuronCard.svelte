<script lang="ts">
  import { NeuronState, TokenAmount } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { CardType } from "$lib/types/card";
  import {
    getSnsDissolvingTimeInSeconds,
    getSnsLockedTimeInSeconds,
    getSnsNeuronStake,
    getSnsNeuronState,
  } from "$lib/utils/sns-neuron.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import NeuronCardContainer from "$lib/components/neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "$lib/components/neurons/NeuronStateInfo.svelte";
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { Spinner } from "@dfinity/gix-components";
  import SnsNeuronCardTitle from "$lib/components/neurons/SnsNeuronCardTitle.svelte";

  export let neuron: SnsNeuron;
  export let role: "link" | undefined = undefined;
  export let cardType: CardType = "card";
  export let ariaLabel: string | undefined = undefined;

  let neuronStake: TokenAmount | undefined;
  $: neuronStake =
    $snsTokenSymbolSelectedStore !== undefined
      ? TokenAmount.fromE8s({
          amount: getSnsNeuronStake(neuron),
          // If we got here is because the token symbol is present.
          // The projects without token are discarded filtered out.
          token: $snsTokenSymbolSelectedStore,
        })
      : undefined;

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getSnsDissolvingTimeInSeconds(neuron);

  let lockedTime: bigint | undefined;
  $: lockedTime = getSnsLockedTimeInSeconds(neuron);
</script>

<NeuronCardContainer on:click {role} {cardType} {ariaLabel}>
  <SnsNeuronCardTitle slot="start" {neuron} />

  <div class="content">
    <div>
      {#if neuronStake !== undefined}
        <AmountDisplay amount={neuronStake} title />
      {:else}
        <Spinner inline size="small" />
      {/if}
    </div>

    <NeuronStateInfo state={neuronState} />
  </div>

  <NeuronStateRemainingTime
    state={getSnsNeuronState(neuron)}
    timeInSeconds={dissolvingTime ?? lockedTime}
  />

  <slot />
</NeuronCardContainer>

<style lang="scss">
  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
  }
</style>
