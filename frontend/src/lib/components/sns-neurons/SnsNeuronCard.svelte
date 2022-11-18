<script lang="ts">
  import { NeuronState, TokenAmount } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import type { CardType } from "$lib/types/card";
  import {
    getSnsDissolvingTimeInSeconds,
    getSnsLockedTimeInSeconds,
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    getSnsNeuronState,
    isUserHotkey,
  } from "$lib/utils/sns-neuron.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import NeuronCardContainer from "../neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "../neurons/NeuronStateInfo.svelte";
  import NeuronStateRemainingTime from "../neurons/NeuronStateRemainingTime.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { Spinner } from "@dfinity/gix-components";

  export let neuron: SnsNeuron;
  export let role: "link" | undefined = undefined;
  export let cardType: CardType = "card";
  export let ariaLabel: string | undefined = undefined;

  let isHotkey: boolean;
  $: isHotkey = isUserHotkey({
    neuron,
    identity: $authStore.identity,
  });

  let neuronId: string;
  $: neuronId = getSnsNeuronIdAsHexString(neuron);

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
  <div class="identifier" slot="start" data-tid="sns-neuron-card-title">
    <Hash id="neuron-id" tagName="p" testId="neuron-id" text={neuronId} />
    {#if isHotkey}
      <span>{$i18n.neurons.hotkey_control}</span>
    {/if}
  </div>

  <div class="content">
    <div class="currency">
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
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/card";

  .identifier {
    @include card.stacked-title;
    :global(h3) {
      margin: 0;
    }
  }

  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
  }
</style>
