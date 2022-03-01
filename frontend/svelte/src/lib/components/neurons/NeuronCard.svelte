<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { NeuronState, ICP } from "@dfinity/nns";
  import type { SvelteComponent } from "svelte";
  import IconHistoryToggleOff from "../../icons/IconHistoryToggleOff.svelte";
  import IconLockClock from "../../icons/IconLockClock.svelte";
  import IconLockOpen from "../../icons/IconLockOpen.svelte";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import ICPComponent from "../ic/ICP.svelte";
  import Card from "../ui/Card.svelte";

  export let neuron: NeuronInfo;
  // Setting default value avoids warning missing props during testing
  export let role: undefined | "link" | "button" = undefined;
  export let ariaLabel: string | undefined = undefined;

  type StateInfo = {
    textKey: string;
    Icon?: typeof SvelteComponent;
    colorVar: "--background-contrast" | "--yellow-500" | "--gray-200";
  };
  type StateMapper = {
    [key: number]: StateInfo;
  };
  const stateTextMapper: StateMapper = {
    [NeuronState.LOCKED]: {
      textKey: "locked",
      Icon: IconLockClock,
      colorVar: "--background-contrast",
    },
    [NeuronState.UNSPECIFIED]: {
      textKey: "unspecified",
      colorVar: "--background-contrast",
    },
    [NeuronState.DISSOLVED]: {
      textKey: "dissolved",
      Icon: IconLockOpen,
      colorVar: "--gray-200",
    },
    [NeuronState.DISSOLVING]: {
      textKey: "dissolving",
      Icon: IconHistoryToggleOff,
      colorVar: "--yellow-500",
    },
  };
  const stateInfo: StateInfo = stateTextMapper[neuron.state];

  const isCommunityFund = !!neuron.joinedCommunityFundTimestampSeconds;
  const isHotKeyControl = !neuron.fullNeuron.isCurrentUserController;

  const neuronICP = ICP.fromE8s(neuron.fullNeuron.cachedNeuronStake);
</script>

<Card {role} on:click {ariaLabel}>
  <div slot="start" class="lock">
    <h4 class:hasNeuronControl={isCommunityFund || isHotKeyControl}>
      {neuron.neuronId}
    </h4>
    {#if isCommunityFund}
      <p class="neuron-control">{$i18n.neurons.community_fund}</p>
    {/if}
    {#if isHotKeyControl}
      <p class="neuron-control">{$i18n.neurons.hotkey_control}</p>
    {/if}
    <h5 style={`color: var(${stateInfo.colorVar});`}>
      {$i18n.neurons[`status_${stateInfo.textKey}`]}
      <svelte:component this={stateInfo.Icon} />
    </h5>
  </div>

  <div slot="end" class="currency">
    <ICPComponent icp={neuronICP} />
    <h5>{$i18n.neurons.stake}</h5>
  </div>

  {#if neuron.state === NeuronState.DISSOLVING && "WhenDissolvedTimestampSeconds" in neuron.fullNeuron.dissolveState}
    <p class="duration">
      {secondsToDuration(
        neuron.fullNeuron.dissolveState.WhenDissolvedTimestampSeconds
      )}
    </p>
  {/if}

  {#if neuron.state === NeuronState.LOCKED && neuron.dissolveDelaySeconds}
    <p class="duration">{secondsToDuration(neuron.dissolveDelaySeconds)}</p>
  {/if}
</Card>

<style lang="scss">
  h4 {
    line-height: var(--line-height-standard);
  }

  h4.hasNeuronControl {
    margin-bottom: 0;
  }

  .neuron-control {
    margin-top: 0;
  }

  .lock {
    margin-bottom: 0;
    h5 {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
  }

  .currency {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .duration {
    font-size: var(--font-size-h5);
  }
</style>
