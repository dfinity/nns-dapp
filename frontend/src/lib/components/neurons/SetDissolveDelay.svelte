<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    daysToSeconds,
    secondsToDays,
    secondsToDaysRoundedDown,
  } from "$lib/utils/date.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { InputRange, Html } from "@dfinity/gix-components";
  import { valueSpan } from "$lib/utils/utils";
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import DayInput from "$lib/components/ui/DayInput.svelte";
  import { daysToDuration } from "$lib/utils/date.utils";
  import type { NeuronState } from "@dfinity/nns";
  import { type TokenAmount, nonNullish } from "@dfinity/utils";

  export let neuronState: NeuronState;
  export let neuronDissolveDelaySeconds: bigint;
  export let neuronStake: TokenAmount;
  export let delayInSeconds = 0;
  export let minProjectDelayInSeconds: number;
  export let maxDelayInSeconds = 0;
  // sns and nns calculates voting power differently
  export let calculateVotingPower: (delayInSeconds: number) => number;
  export let minDissolveDelayDescription = "";

  const dispatch = createEventDispatcher();

  let delayInDays = secondsToDays(delayInSeconds);

  $: delayInSeconds = daysToSeconds(delayInDays);

  let neuronDelayInDays = secondsToDays(Number(neuronDissolveDelaySeconds));

  let minDelayInDays = 0;
  $: minDelayInDays = secondsToDays(Number(neuronDissolveDelaySeconds) + 1);

  let minProjectDelayInDays = 0;
  $: minProjectDelayInDays = secondsToDays(minProjectDelayInSeconds);

  let maxDelayInDays = 0;
  $: maxDelayInDays = secondsToDaysRoundedDown(maxDelayInSeconds);

  let votingPower: number;
  $: votingPower = calculateVotingPower(delayInSeconds);

  let inputError: string | undefined;

  let disableUpdate: boolean;
  $: disableUpdate = shouldUpdateBeDisabled(delayInDays);

  const keepDelaysInBounds = () => {
    if (delayInDays < neuronDelayInDays) {
      delayInDays = neuronDelayInDays;
    }

    if (delayInDays > maxDelayInDays) {
      delayInDays = maxDelayInDays;
    }
  };

  const setMin = () => {
    delayInDays = Math.max(minDelayInDays, minProjectDelayInDays);
    updateInputError();
  };

  const setMax = () => {
    delayInDays = maxDelayInDays;
    updateInputError();
  };

  const getInputError = (delayInDays: number) => {
    if (delayInDays > maxDelayInDays) {
      return $i18n.neurons.dissolve_delay_above_maximum;
    }
    if (delayInDays < minDelayInDays) {
      return $i18n.neurons.dissolve_delay_below_current;
    }
    if (delayInDays < minProjectDelayInDays) {
      return $i18n.neurons.dissolve_delay_below_minimum;
    }
    return undefined;
  };

  const updateInputError = () => {
    inputError = getInputError(delayInDays);
  };

  const shouldUpdateBeDisabled = (delayInDays: number): boolean => {
    const error = getInputError(delayInDays);
    // It's allowed to set the dissolve delay below the project minimum but we
    // still show a warning message to the user.
    return (
      nonNullish(error) && error !== $i18n.neurons.dissolve_delay_below_minimum
    );
  };

  const onRangeInput = () => {
    keepDelaysInBounds();
    updateInputError();
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
        max={maxDelayInDays}
        bind:value={delayInDays}
        handleInput={onRangeInput}
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
