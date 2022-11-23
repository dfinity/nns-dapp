<script lang="ts">
  import { ICPToken, TokenAmount, type NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    getDissolvingTimeInSeconds,
    getSpawningTimeInSeconds,
    hasJoinedCommunityFund,
    isHotKeyControllable,
    isSpawning,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import type { CardType } from "$lib/types/card";
  import NeuronCardContainer from "./NeuronCardContainer.svelte";
  import { IconStackedLineChart } from "@dfinity/gix-components";
  import NeuronStateInfo from "./NeuronStateInfo.svelte";
  import NeuronStateRemainingTime from "./NeuronStateRemainingTime.svelte";

  export let neuron: NeuronInfo;
  export let proposerNeuron = false;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected = false;
  export let disabled = false;
  export let cardType: CardType = "card";

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);
  let neuronICP: TokenAmount;
  $: neuronICP = TokenAmount.fromE8s({
    amount: neuronStake(neuron),
    token: ICPToken,
  });
  let isHotKeyControl: boolean;
  $: isHotKeyControl = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });
  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getDissolvingTimeInSeconds(neuron);

  let spawningTime: bigint | undefined;
  $: spawningTime = getSpawningTimeInSeconds(neuron);
</script>

<NeuronCardContainer
  {role}
  {selected}
  {disabled}
  {ariaLabel}
  on:click
  {cardType}
>
  <div slot="start" class="lock" data-tid="neuron-card-title">
    <p data-tid="neuron-id">{neuron.neuronId}</p>

    {#if isCommunityFund}
      <small class="label">{$i18n.neurons.community_fund}</small>
    {/if}
    {#if isHotKeyControl}
      <small class="label">{$i18n.neurons.hotkey_control}</small>
    {/if}
  </div>

  <div class:disabled class="content">
    {#if isSpawning(neuron)}
      <IconStackedLineChart />
    {:else if proposerNeuron}
      <AmountDisplay
        title
        label={$i18n.neurons.voting_power}
        amount={TokenAmount.fromE8s({
          amount: neuron.votingPower,
          token: ICPToken,
        })}
        detailed
      />
    {:else if neuronICP}
      <AmountDisplay title amount={neuronICP} detailed />
    {/if}

    <NeuronStateInfo state={neuron.state} />
  </div>

  <NeuronStateRemainingTime
    state={neuron.state}
    timeInSeconds={dissolvingTime ??
      spawningTime ??
      neuron.dissolveDelaySeconds}
    noBottomGap
  />

  <slot />
</NeuronCardContainer>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";

  // TODO: avoid root global styling
  :global(div.modal article > div) {
    margin-bottom: 0;
  }

  h3 {
    line-height: var(--line-height-standard);
    margin-bottom: 0;
  }

  .lock {
    @include card.stacked-title;
  }

  .disabled {
    --amount-color: rgba(var(--disable-contrast-rgb), 0.2);
  }

  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    width: 100%;
  }
</style>
