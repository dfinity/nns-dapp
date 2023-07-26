<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { daysToSeconds, secondsToDays } from "$lib/utils/date.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { InputRange, Html } from "@dfinity/gix-components";
  import { isDefined, valueSpan } from "$lib/utils/utils";
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import DayInput from "$lib/components/ui/DayInput.svelte";
  import { daysToDuration } from "$lib/utils/date.utils";
  import type { NeuronState } from "@dfinity/nns";
  import type { TokenAmount } from "@dfinity/utils";
  import { SECONDS_IN_DAY } from "$lib/constants/constants";

  export let neuronState: NeuronState;
  export let neuronDissolveDelaySeconds: bigint;
  export let neuronStake: TokenAmount;
  export let delayInSeconds = 0;
  export let minDelayInSeconds = 0;
  export let minProjectDelayInSeconds: number;
  export let maxDelayInSeconds = 0;
  // sns and nns calculates voting power differently
  export let calculateVotingPower: (delayInSeconds: number) => number;
  export let minDissolveDelayDescription = "";

  const dispatch = createEventDispatcher();

  let delayInDays = 0;
  $: delayInSeconds, (() => (delayInDays = secondsToDays(delayInSeconds)))();

  let minDelayInDays = 0;
  $: minDelayInDays = secondsToDays(minDelayInSeconds);

  let minProjectDelayInDays = 0;
  $: minProjectDelayInDays = secondsToDays(minProjectDelayInSeconds);

  let maxDelayInDays = 0;
  $: maxDelayInDays = secondsToDays(maxDelayInSeconds);

  let votingPower: number;
  $: votingPower = calculateVotingPower(delayInSeconds);

  let inputError: string | undefined;

  let disableUpdate: boolean;
  $: disableUpdate =
    delayInSeconds < minProjectDelayInSeconds ||
    delayInSeconds <= minDelayInSeconds ||
    delayInSeconds > maxDelayInSeconds;

  const keepDelaysInBounds = () => {
    if (delayInSeconds < minDelayInSeconds) {
      delayInSeconds = minDelayInSeconds;
    }

    if (delayInSeconds > maxDelayInSeconds) {
      delayInSeconds = maxDelayInSeconds;
    }

    // hide the error
    inputError = undefined;
  };
  const setMin = () => {
    delayInSeconds = Math.max(
      minDelayInSeconds + SECONDS_IN_DAY,
      minProjectDelayInSeconds
    );
    keepDelaysInBounds();
  };
  const setMax = () => {
    delayInSeconds = maxDelayInSeconds;
    keepDelaysInBounds();
  };
  const updateInputError = () => {
    console.log("updateInputError", delayInDays, maxDelayInDays);
    if (delayInDays > maxDelayInDays) {
      inputError = $i18n.neurons.dissolve_delay_above_maximum;
    } else if (delayInDays < minProjectDelayInDays) {
      inputError = $i18n.neurons.dissolve_delay_below_minimum;
    } else if (delayInDays <= minDelayInDays) {
      inputError = $i18n.neurons.dissolve_delay_below_current;
    } else if (isDefined(inputError)) {
      // clear the error
      inputError = undefined;
    }

    delayInSeconds = daysToSeconds(delayInDays);
  };
  const cancel = () => dispatch("nnsCancel");
  const goToConfirmation = () => dispatch("nnsConfirmDelay");
</script>

<div class="wrapper" data-tid="set-dissolve-delay-component">
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <slot name="neuron-id" />
  </div>

  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="neuron-stake">
      <Html
        text={replacePlaceholders($i18n.sns_neurons.token_stake, {
          $amount: valueSpan(
            formatToken({ value: neuronStake.toE8s(), detailed: true })
          ),
          $token: neuronStake.token.symbol,
        })}
      />
    </p>
  </div>

  {#if neuronDissolveDelaySeconds}
    <div>
      <p class="label">{$i18n.neurons.current_dissolve_delay}</p>
      <NeuronStateRemainingTime
        state={neuronState}
        timeInSeconds={neuronDissolveDelaySeconds}
        defaultGaps
      />
    </div>
  {/if}

  <div>
    <p class="label">{$i18n.neurons.dissolve_delay_title}</p>
    <p class="description">{minDissolveDelayDescription}</p>
  </div>
  <div class="select-delay-container">
    <p class="subtitle">{$i18n.neurons.dissolve_delay_label}</p>
    <div>
      <DayInput
        bind:days={delayInDays}
        on:nnsMin={setMin}
        on:nnsMax={setMax}
        on:nnsInput={updateInputError}
        on:blur={updateInputError}
        errorMessage={inputError}
        placeholderLabelKey="neurons.dissolve_delay_placeholder"
        name="dissolve_delay"
      />
    </div>
    <div class="range">
      <InputRange
        ariaLabel={$i18n.neuron_detail.dissolve_delay_range}
        min={0}
        max={maxDelayInSeconds}
        bind:value={delayInSeconds}
        handleInput={keepDelaysInBounds}
      />
      <div class="details">
        <div>
          <p class="label">
            {formatVotingPower(votingPower)}
          </p>
          <p>{$i18n.neurons.voting_power}</p>
        </div>
        <div>
          {#if delayInSeconds > 0}
            <p class="label">{daysToDuration(delayInDays)}</p>
          {:else}
            <p class="label">{$i18n.neurons.no_delay}</p>
          {/if}
          <p>{$i18n.neurons.dissolve_delay_title}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="toolbar">
    <button on:click={cancel} data-tid="cancel-neuron-delay" class="secondary"
      ><slot name="cancel" /></button
    >
    <button
      class="primary"
      disabled={disableUpdate}
      on:click={goToConfirmation}
      data-tid="go-confirm-delay-button"><slot name="confirm" /></button
    >
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .range {
    margin-top: var(--padding-2x);
  }

  .select-delay-container {
    width: 100%;

    .details {
      margin-top: var(--padding);
      display: flex;
      justify-content: space-around;
    }
  }
</style>
