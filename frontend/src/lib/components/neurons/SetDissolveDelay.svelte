<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import {
    SECONDS_IN_EIGHT_YEARS,
    SECONDS_IN_HALF_YEAR,
  } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import {
    daysToSeconds,
    secondsToDate,
    secondsToDays,
    secondsToDuration,
  } from "$lib/utils/date.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import {
    formatVotingPower,
    neuronStake,
    neuronVotingPower,
  } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { InputRange, Html } from "@dfinity/gix-components";
  import { valueSpan } from "$lib/utils/utils";
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import DayInput from "$lib/components/ui/DayInput.svelte";
  import { daysToDuration } from "$lib/utils/date.utils.js";

  export let neuron: NeuronInfo;
  export let delayInSeconds = 0;
  export let minDelayInSeconds = 0;
  export let cancelButtonText: string;
  export let confirmButtonText: string;

  let delayInDays = 0;
  $: delayInSeconds, (() => (delayInDays = secondsToDays(delayInSeconds)))();

  let minDelayInDays = 0;
  $: minDelayInDays = secondsToDays(minDelayInSeconds);

  const maxDelayInDays = secondsToDays(SECONDS_IN_EIGHT_YEARS);
  const checkMinMax = () => {
    if (delayInDays < minDelayInDays) {
      delayInDays = minDelayInDays;
    }

    if (delayInDays > maxDelayInDays) {
      delayInDays = maxDelayInDays;
    }

    delayInSeconds = daysToSeconds(delayInDays);
  };

  let disableUpdate: boolean;
  $: disableUpdate =
    delayInDays < secondsToDays(SECONDS_IN_HALF_YEAR) ||
    delayInDays <= minDelayInDays ||
    delayInDays > maxDelayInDays;

  let days: number;
  $: days = secondsToDays(delayInSeconds);

  const dispatcher = createEventDispatcher();
  const cancel = (): void => {
    dispatcher("nnsCancel");
  };
  let neuronICP: bigint;
  $: neuronICP = neuronStake(neuron);

  const goToConfirmation = async () => {
    dispatcher("nnsConfirmDelay");
  };
  const setMin = () => {
    delayInDays = Math.max(
      minDelayInDays + 1,
      secondsToDays(SECONDS_IN_HALF_YEAR)
    );
    checkMinMax();
  };
  const setMax = () => {
    delayInDays = maxDelayInDays;
    checkMinMax();
  };
</script>

<div class="wrapper">
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <p class="value">{neuron.neuronId}</p>
  </div>

  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="neuron-stake">
      <Html
        text={replacePlaceholders($i18n.neurons.amount_icp_stake, {
          $amount: valueSpan(formatToken({ value: neuronICP, detailed: true })),
        })}
      />
    </p>
  </div>

  {#if neuron.dissolveDelaySeconds}
    <div>
      <p class="label">{$i18n.neurons.current_dissolve_delay}</p>
      <NeuronStateRemainingTime
        state={neuron.state}
        timeInSeconds={neuron.dissolveDelaySeconds}
        defaultGaps
      />
    </div>
  {/if}

  <div>
    <p class="label">{$i18n.neurons.dissolve_delay_title}</p>
    <p class="description">{$i18n.neurons.dissolve_delay_description}</p>
  </div>
  <div class="select-delay-container">
    <p class="subtitle">{$i18n.neurons.dissolve_delay_label}</p>
    <div>
      <DayInput
        min={0}
        max={maxDelayInDays}
        bind:days={delayInDays}
        on:input={checkMinMax}
        on:nnsMin={setMin}
        on:nnsMax={setMax}
      />
    </div>
    <div class="range">
      <InputRange
        ariaLabel={$i18n.neuron_detail.dissolve_delay_range}
        min={0}
        max={maxDelayInDays}
        bind:value={delayInDays}
        handleInput={checkMinMax}
      />
      <div class="details">
        <div>
          <p class="label">
            {formatVotingPower(
              neuronVotingPower({
                neuron,
                newDissolveDelayInSeconds: BigInt(delayInSeconds),
              })
            )}
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
      >{cancelButtonText}</button
    >
    <button
      class="primary"
      disabled={disableUpdate}
      on:click={goToConfirmation}
      data-tid="go-confirm-delay-button"
    >
      {confirmButtonText}
    </button>
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
