<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { NeuronState, ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import {
    getDissolvingTimeInSeconds,
    getStateInfo,
    hasJoinedCommunityFund,
    isCurrentUserController,
    neuronStake,
  } from "../../utils/neuron.utils";
  import type { StateInfo } from "../../utils/neuron.utils";
  import ICPComponent from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";
  import { accountsStore } from "../../stores/accounts.store";
  import { replacePlaceholders } from "../../utils/i18n.utils";

  export let neuron: NeuronInfo;
  export let proposerNeuron: boolean = false;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" = undefined;
  export let ariaLabel: string | undefined = undefined;

  // TODO: https://dfinity.atlassian.net/browse/L2-366
  let stateInfo: StateInfo;
  $: stateInfo = getStateInfo(neuron.state);
  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);
  let neuronICP: ICP;
  $: neuronICP = ICP.fromE8s(neuronStake(neuron));
  let isHotKeyControl: boolean;
  $: isHotKeyControl = !isCurrentUserController(neuron, $accountsStore.main);
  let dissolvingTime: bigint | undefined;
  $: dissolvingTime = getDissolvingTimeInSeconds(neuron);
</script>

<Card {role} on:click {ariaLabel}>
  <div slot="start" class="lock" data-tid="neuron-card-title">
    <h3 class:has-neuron-control={isCommunityFund || isHotKeyControl}>
      {neuron.neuronId}
    </h3>

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
      />
    {:else if neuronICP}
      <ICPComponent icp={neuronICP} />
    {/if}
  </div>

  <div class="info">
    <p style={`color: var(${stateInfo.colorVar});`} class="status">
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
</Card>

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
        margin-left: calc(var(--padding) / 2);
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
