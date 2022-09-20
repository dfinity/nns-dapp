<script lang="ts">
  import { TokenAmount, type NeuronInfo } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import {
    getDissolvingTimeInSeconds,
    getSpawningTimeInSeconds,
    hasJoinedCommunityFund,
    isHotKeyControllable,
    isSpawning,
    neuronStake,
  } from "../../utils/neuron.utils";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import { authStore } from "../../stores/auth.store";
  import type { CardType } from "../../types/card";
  import NeuronCardContainer from "./NeuronCardContainer.svelte";
  import { IconStackedLineChart } from "@dfinity/gix-components";
  import NeuronStateInfo from "./NeuronStateInfo.svelte";
  import NeuronInfoDisplay from "./NeuronInfoDisplay.svelte";
  import NeuronStateRemainingTime from "./NeuronStateRemainingTime.svelte";

  export let neuron: NeuronInfo;
  export let proposerNeuron: boolean = false;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected: boolean = false;
  export let disabled: boolean = false;
  export let cardType: CardType = "card";

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);
  let neuronICP: TokenAmount;
  $: neuronICP = TokenAmount.fromE8s({ amount: neuronStake(neuron) });
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
  <!-- Staked ICP -->
  <NeuronInfoDisplay>
    <h3 slot="start">{$i18n.neurons.staked_icp}</h3>

    <svelte:fragment slot="end">
      {#if isSpawning(neuron)}
        <IconStackedLineChart />
      {:else if proposerNeuron}
        <AmountDisplay singleLine
                label={$i18n.neurons.voting_power}
                amount={TokenAmount.fromE8s({ amount: neuron.votingPower })}
                detailed
        />
      {:else if neuronICP}
        <AmountDisplay amount={neuronICP} detailed />
      {/if}
    </svelte:fragment>
  </NeuronInfoDisplay>

  <!-- Staked Maturity -->
  <NeuronInfoDisplay>
    <h3 slot="start">{$i18n.neurons.staked_maturity}</h3>

    <span slot="end">
      999 (TODO)
    </span>
  </NeuronInfoDisplay>

  <!-- Neuron meta information -->
  {#if isCommunityFund}
    <p class="description">{$i18n.neurons.community_fund}</p>
  {/if}
  {#if isHotKeyControl}
    <p class="description">{$i18n.neurons.hotkey_control}</p>
  {/if}

  <NeuronStateInfo state={neuron.state} />

  <NeuronStateRemainingTime
    state={neuron.state}
    timeInSeconds={dissolvingTime ??
      spawningTime ??
      neuron.dissolveDelaySeconds}
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

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .description {
    margin: 0 0 var(--padding-2x);
  }
</style>
