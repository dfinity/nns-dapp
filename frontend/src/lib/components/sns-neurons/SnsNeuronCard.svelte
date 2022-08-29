<script lang="ts">
  import {ICP, NeuronState} from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import { authStore } from "../../stores/auth.store";
  import { i18n } from "../../stores/i18n";
  import type { CardType } from "../../types/card";
  import {
    getSnsDissolvingTimeInSeconds,
    getSnsLockedTimeInSeconds,
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    getSnsNeuronState,
    isUserHotkey,
  } from "../../utils/sns-neuron.utils";
  import IcpComponent from "../ic/ICP.svelte";
  import NeuronCardContainer from "../neurons/NeuronCardContainer.svelte";
  import NeuronStateInfo from "../neurons/NeuronStateInfo.svelte";
  import NeuronStateRemainingTime from "../neurons/NeuronStateRemainingTime.svelte";
  import Hash from "../ui/Hash.svelte";
  import { snsTokenSymbolSelectedStore } from "../../derived/sns/sns-token-symbol-selected.store";

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

  let neuronICP: ICP;
  $: neuronICP = ICP.fromE8s(getSnsNeuronStake(neuron));

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);

  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getSnsDissolvingTimeInSeconds(neuron);

  let lockedTime: bigint | undefined;
  $: lockedTime = getSnsLockedTimeInSeconds(neuron);
</script>

<NeuronCardContainer on:click {role} {cardType} {ariaLabel}>
  <div class="identifier" slot="start" data-tid="sns-neuron-card-title">
    <Hash id="neuron-id" tagName="h3" testId="neuron-id" text={neuronId} />
    {#if isHotkey}
      <span>{$i18n.neurons.hotkey_control}</span>
    {/if}
  </div>

  <div slot="end" class="currency">
    <IcpComponent
      icp={neuronICP}
      detailed
      label={$snsTokenSymbolSelectedStore}
    />
  </div>

  <NeuronStateInfo state={neuronState} />

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

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    margin-bottom: var(--padding);

    @include media.min-width(medium) {
      margin-bottom: 0;
    }
  }
</style>
