<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import {
    getDissolvingTimeInSeconds,
    getSpawningTimeInSeconds,
    getStateInfo,
    hasJoinedCommunityFund,
    isHotKeyControllable,
    isSpawning,
    neuronStake,
  } from "../../utils/neuron.utils";
  import type { StateInfo } from "../../utils/neuron.utils";
  import ICPComponent from "../ic/ICP.svelte";
  import { authStore } from "../../stores/auth.store";
  import type { CardType } from "../../types/card";
  import NeuronCardContainer from "./NeuronCardContainer.svelte";
  import IconStackedLineChart from "../../icons/IconStackedLineChart.svelte";
  import NeuronStateInfo from "./NeuronStateInfo.svelte";
  import NeuronStateRemainingTime from "./NeuronStateRemainingTime.svelte";

  export let neuron: NeuronInfo;
  export let proposerNeuron: boolean = false;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected: boolean = false;
  export let disabled: boolean = false;
  export let cardType: CardType = "card";

  let stateInfo: StateInfo | undefined;
  $: stateInfo = getStateInfo(neuron.state);
  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);
  let neuronICP: ICP;
  $: neuronICP = ICP.fromE8s(neuronStake(neuron));
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
    <h3 data-tid="neuron-id">{neuron.neuronId}</h3>

    {#if isCommunityFund}
      <span>{$i18n.neurons.community_fund}</span>
    {/if}
    {#if isHotKeyControl}
      <span>{$i18n.neurons.hotkey_control}</span>
    {/if}
  </div>

  <div slot="end" class="currency">
    {#if isSpawning(neuron)}
      <IconStackedLineChart />
    {:else if proposerNeuron}
      <ICPComponent
        label={$i18n.neurons.voting_power}
        icp={ICP.fromE8s(neuron.votingPower)}
        detailed
      />
    {:else if neuronICP}
      <ICPComponent icp={neuronICP} detailed />
    {/if}
  </div>

  <NeuronStateInfo {stateInfo} />

  <NeuronStateRemainingTime
    state={neuron.state}
    timeInSeconds={dissolvingTime ??
      spawningTime ??
      neuron.dissolveDelaySeconds}
  />

  <slot />
</NeuronCardContainer>

<style lang="scss">
  @use "../../themes/mixins/card";

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

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
</style>
