<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import Card from "../ui/Card.svelte";
  import Spinner from "../ui/Spinner.svelte";
  import {
    SECONDS_IN_EIGHT_YEARS,
    SECONDS_IN_HALF_YEAR,
  } from "../../constants/constants";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import { formatICP } from "../../utils/icp.utils";
  import {
    formatVotingPower,
    neuronStake,
    votingPower,
  } from "../../utils/neuron.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";

  export let neuron: NeuronInfo;
  export let delayInSeconds: number = 0;
  export let cancelButtonText: string;
  export let minDelayInSeconds: number = 0;

  let loading: boolean = false;

  let backgroundStyle: string;
  $: {
    const firstHalf: number = Math.round(
      (delayInSeconds / SECONDS_IN_EIGHT_YEARS) * 100
    );
    backgroundStyle = `linear-gradient(90deg, var(--background-contrast) ${firstHalf}%, var(--gray-200) ${
      1 - firstHalf
    }%)`;
  }

  const checkMinimum = () => {
    if (delayInSeconds < minDelayInSeconds) {
      delayInSeconds = minDelayInSeconds;
    }
  };

  let disableUpdate: boolean;
  $: disableUpdate =
    delayInSeconds < SECONDS_IN_HALF_YEAR ||
    delayInSeconds <= minDelayInSeconds;
  const dispatcher = createEventDispatcher();
  const cancel = (): void => {
    dispatcher("nnsCancel");
  };
  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  const goToConfirmation = async () => {
    dispatcher("nnsConfirmDelay");
  };
</script>

<div class="wizard-wrapper wrapper">
  <div>
    <h5>{$i18n.neurons.neuron_id}</h5>
    <p>{neuron.neuronId}</p>
  </div>
  <div>
    <h5>{$i18n.neurons.neuron_balance}</h5>
    <p data-tid="neuron-stake">
      {replacePlaceholders($i18n.neurons.icp_stake, {
        $amount: formatICP(neuronICP),
      })}
    </p>
  </div>
  <div>
    {#if neuron.state === NeuronState.LOCKED && neuron.dissolveDelaySeconds}
      <h5>{$i18n.neurons.current_dissolve_delay}</h5>
      <p class="duration">
        {secondsToDuration(neuron.dissolveDelaySeconds)} - {$i18n.neurons
          .staked}
      </p>
    {/if}
  </div>
  <Card>
    <div slot="start">
      <h5>{$i18n.neurons.dissolve_delay_title}</h5>
      <p>{$i18n.neurons.dissolve_delay_description}</p>
    </div>
    <div class="select-delay-container">
      <!-- Order of on:input and bind:value matters: https://svelte.dev/docs#template-syntax-element-directives-bind-property -->
      <input
        min={0}
        max={SECONDS_IN_EIGHT_YEARS}
        type="range"
        bind:value={delayInSeconds}
        on:input={checkMinimum}
        style={`background-image: ${backgroundStyle};`}
      />
      <div class="details">
        <div>
          <h5>
            {formatVotingPower(
              votingPower({
                stake: neuronICP,
                dissolveDelayInSeconds: delayInSeconds,
              })
            )}
          </h5>
          <p>{$i18n.neurons.voting_power}</p>
        </div>
        <div>
          {#if delayInSeconds > 0}
            <h5>{secondsToDuration(BigInt(delayInSeconds))}</h5>
          {:else}
            <h5>{$i18n.neurons.no_delay}</h5>
          {/if}
          <p>{$i18n.neurons.dissolve_delay_title}</p>
        </div>
      </div>
    </div>
  </Card>
  <div class="buttons">
    <button
      on:click={cancel}
      data-tid="cancel-neuron-delay"
      class="secondary full-width"
      disabled={loading}>{cancelButtonText}</button
    >
    <button
      class="primary full-width"
      disabled={disableUpdate || loading}
      on:click={goToConfirmation}
      data-tid="go-confirm-delay-button"
    >
      {#if loading}
        <Spinner />
      {:else}
        {$i18n.neurons.update_delay}
      {/if}
    </button>
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/interaction";

  p {
    margin-top: 0;
  }

  .select-delay-container {
    width: 100%;

    input {
      width: 100%;
    }

    .details {
      margin-top: var(--padding);
      display: flex;
      justify-content: space-around;
    }
  }

  input[type="range"] {
    appearance: none;
    border-radius: 6px;
    height: 6px;
    width: 100%;
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]::-moz-focus-outer {
    border: 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
    appearance: none;
  }

  input[type="range"]::-moz-range-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
  }

  input[type="range"]::-ms-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    @include interaction.tappable;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    cursor: pointer;
  }

  .buttons {
    display: flex;
    gap: var(--padding);
  }

  .wrapper {
    :global(article) {
      flex-grow: 1;
      margin: 0 0 var(--padding-2x);
    }
  }
</style>
