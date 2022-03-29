<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { NeuronState, ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import { getStateInfo } from "../../utils/neuron.utils";
  import type { StateInfo } from "../../utils/neuron.utils";
  import ICPComponent from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";

  export let neuron: NeuronInfo;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" = undefined;
  export let ariaLabel: string | undefined = undefined;

  // TODO: https://dfinity.atlassian.net/browse/L2-366
  let stateInfo: StateInfo;
  $: stateInfo = getStateInfo(neuron.state);
  let isCommunityFund: boolean;
  $: isCommunityFund = neuron.joinedCommunityFundTimestampSeconds !== undefined;
  let neuronICP: ICP;
  $: neuronICP =
    neuron.fullNeuron?.cachedNeuronStake !== undefined
      ? ICP.fromE8s(neuron.fullNeuron.cachedNeuronStake)
      : ICP.fromE8s(BigInt(0));
  $: isHotKeyControl =
    neuron.fullNeuron?.isCurrentUserController === undefined
      ? true
      : !neuron.fullNeuron?.isCurrentUserController;
  let dissolvingTime: bigint | undefined;
  $: dissolvingTime =
    neuron.state === NeuronState.DISSOLVING &&
    neuron.fullNeuron !== undefined &&
    neuron.fullNeuron.dissolveState !== undefined &&
    "WhenDissolvedTimestampSeconds" in neuron.fullNeuron.dissolveState
      ? neuron.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds
      : undefined;
</script>

<Card {role} on:click {ariaLabel}>
  <div slot="start" class="lock" data-tid="neuron-card-title">
    <h3 class:has-neuron-control={isCommunityFund || isHotKeyControl}>
      {neuron.neuronId}
    </h3>

    <span class="neuron-control">{$i18n.neurons.hotkey_control}</span>

    {#if isCommunityFund}
      <span class="neuron-control">{$i18n.neurons.community_fund}</span>
    {/if}
    {#if isHotKeyControl}
      <span class="neuron-control">{$i18n.neurons.hotkey_control}</span>
    {/if}
  </div>

  <div slot="end" class="currency">
    {#if neuronICP}
      <ICPComponent icp={neuronICP} />
    {/if}
  </div>

  <div class="info">
    <p style={`color: var(${stateInfo.colorVar});`} class="status">
      {$i18n.neurons[`status_${stateInfo.textKey}`]}
      <svelte:component this={stateInfo.Icon} />
    </p>

    <p>{$i18n.neurons.stake}</p>
  </div>

  {#if dissolvingTime !== undefined}
    <p class="duration">
      {secondsToDuration(dissolvingTime)} - {$i18n.neurons.staked}
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
