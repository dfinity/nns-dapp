<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { NeuronState, ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import { getStateInfo, StateInfo } from "../../utils/neuron.utils";
  import ICPComponent from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";

  export let neuron: NeuronInfo;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" = undefined;
  export let ariaLabel: string | undefined = undefined;

  let stateInfo: StateInfo;
  $: stateInfo = getStateInfo(neuron.state);
  let isCommunityFund: boolean;
  $: isCommunityFund = !!neuron.joinedCommunityFundTimestampSeconds;
  let isHotKeyControl: boolean;
  $: isHotKeyControl = !neuron.fullNeuron?.isCurrentUserController;
  let neuronICP: ICP;
  $: neuronICP = ICP.fromE8s(neuron.fullNeuron?.cachedNeuronStake || BigInt(0));
</script>

<Card {role} on:click {ariaLabel}>
  <div slot="start" class="lock">
    <h3 class:has-neuron-control={isCommunityFund || isHotKeyControl}>
      {neuron.neuronId}
    </h3>

    {#if isCommunityFund}
      <span class="neuron-control">{$i18n.neurons.community_fund}</span>
    {/if}
    {#if isHotKeyControl}
      <span class="neuron-control">{$i18n.neurons.hotkey_control}</span>
    {/if}

    <p style={`color: var(${stateInfo.colorVar});`} class="status info">
      {$i18n.neurons[`status_${stateInfo.textKey}`]}
      <svelte:component this={stateInfo.Icon} />
    </p>

    {#if neuron.state === NeuronState.DISSOLVING && neuron.fullNeuron?.dissolveState && "WhenDissolvedTimestampSeconds" in neuron.fullNeuron.dissolveState}
      <p class="duration">
        {secondsToDuration(
          neuron.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds
        )} - {$i18n.neurons.staked}
      </p>
    {/if}

    {#if neuron.state === NeuronState.LOCKED && neuron.dissolveDelaySeconds}
      <p class="duration">
        {secondsToDuration(neuron.dissolveDelaySeconds)} - {$i18n.neurons
          .staked}
      </p>
    {/if}
  </div>

  <div slot="end" class="currency">
    <ICPComponent icp={neuronICP} />
    <p class="info">{$i18n.neurons.stake}</p>
  </div>
</Card>

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
    margin-bottom: 0;
  }

  .lock {
    display: flex;
    flex-direction: column;
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
    margin: calc(2 * var(--padding)) 0 0;
  }

  .duration {
    margin: 0;
  }
</style>
