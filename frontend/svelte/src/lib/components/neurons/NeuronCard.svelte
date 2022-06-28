<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { NeuronState, ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import {
    getDissolvingTimeInSeconds,
    getStateInfo,
    hasJoinedCommunityFund,
    isHotKeyControllable,
    neuronStake,
  } from "../../utils/neuron.utils";
  import type { StateInfo } from "../../utils/neuron.utils";
  import ICPComponent from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import { authStore } from "../../stores/auth.store";
  import type { CardType } from "../../types/card";
  import type { SvelteComponent } from "svelte";
  import CardInfo from "../ui/CardInfo.svelte";

  export let neuron: NeuronInfo;
  export let proposerNeuron: boolean = false;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" | "checkbox" = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected: boolean = false;
  export let disabled: boolean | undefined = undefined;

  // TODO: https://dfinity.atlassian.net/browse/L2-366
  let stateInfo: StateInfo;
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

  export let cardType: CardType = "card";

  const cards: Record<CardType, typeof SvelteComponent> = {
    card: Card,
    info: CardInfo,
  };
</script>

<svelte:component
  this={cards[cardType]}
  {role}
  {selected}
  {disabled}
  on:click
  {ariaLabel}
  testId="neuron-card"
>
  <div slot="start" class="lock" data-tid="neuron-card-title">
    <h3 data-tid="neuron-id">{neuron.neuronId}</h3>

    {#if isCommunityFund}
      <span class="neuron-control">{$i18n.neurons.community_fund}</span>
    {/if}
    {#if isHotKeyControl}
      <span class="neuron-control">{$i18n.neurons.hotkey_control}</span>
    {/if}
  </div>

  <div slot="end" class="currency">
    {#if proposerNeuron}
      <ICPComponent
        label={$i18n.neurons.voting_power}
        icp={ICP.fromE8s(neuron.votingPower)}
        detailed
      />
    {:else if neuronICP}
      <ICPComponent icp={neuronICP} detailed />
    {/if}
  </div>

  <div class="info">
    <p style={stateInfo.status === 'warn' ? `color: var(--yellow-500);` : ''} class="status">
      {$i18n.neurons[`status_${stateInfo.textKey}`]}
      <svelte:component this={stateInfo.Icon} />
    </p>
  </div>

  {#if dissolvingTime !== undefined}
    <p class="duration">
      {replacePlaceholders($i18n.neurons.remaining, {
        $duration: secondsToDuration(dissolvingTime),
      })}
    </p>
  {/if}

  {#if neuron.state === NeuronState.LOCKED && neuron.dissolveDelaySeconds}
    <p class="duration">
      {secondsToDuration(neuron.dissolveDelaySeconds)}
      - {$i18n.neurons.dissolve_delay_title}
    </p>
  {/if}

  <slot />
</svelte:component>

<style lang="scss">
  @use "../../themes/mixins/display";
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

  .status {
    display: inline-flex;

    :global {
      svg {
        margin-left: var(--padding-0_5x);
      }
    }
  }

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .info {
    @include display.space-between;
    align-items: center;

    p {
      margin: 0;
    }
  }

  .duration {
    margin: 0;
  }
</style>
