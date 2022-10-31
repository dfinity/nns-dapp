<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import {
    SECONDS_IN_EIGHT_YEARS,
    SECONDS_IN_HALF_YEAR,
  } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import {
    formatVotingPower,
    neuronStake,
    votingPower,
  } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { InputRange, Html } from "@dfinity/gix-components";
  import { valueSpan } from "$lib/utils/utils";

  export let neuron: NeuronInfo;
  export let delayInSeconds = 0;
  export let cancelButtonText: string;
  export let confirmButtonText: string;
  export let minDelayInSeconds = 0;

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

<div class="wrapper">
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <p class="value">{neuron.neuronId}</p>
  </div>

  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="neuron-stake">
      <Html
        text={replacePlaceholders($i18n.neurons.icp_stake, {
          $amount: valueSpan(formatToken({ value: neuronICP, detailed: true })),
        })}
      />
    </p>
  </div>

  {#if neuron.state === NeuronState.Locked && neuron.dissolveDelaySeconds}
    <div>
      <p class="label">{$i18n.neurons.current_dissolve_delay}</p>
      <p class="duration">
        <Html
          text={`${valueSpan(
            secondsToDuration(neuron.dissolveDelaySeconds)
          )} - ${$i18n.neurons.staked}`}
        />
      </p>
    </div>
  {/if}

  <div>
    <p class="label">{$i18n.neurons.dissolve_delay_title}</p>
    <p class="description">{$i18n.neurons.dissolve_delay_description}</p>

    <div class="select-delay-container">
      <InputRange
        ariaLabel={$i18n.neuron_detail.dissolve_delay_range}
        min={0}
        max={SECONDS_IN_EIGHT_YEARS}
        bind:value={delayInSeconds}
        handleInput={checkMinimum}
      />
      <div class="details">
        <div>
          <p class="label">
            {formatVotingPower(
              votingPower({
                stake: neuronICP,
                dissolveDelayInSeconds: delayInSeconds,
              })
            )}
          </p>
          <p>{$i18n.neurons.voting_power}</p>
        </div>
        <div>
          {#if delayInSeconds > 0}
            <p class="label">{secondsToDuration(BigInt(delayInSeconds))}</p>
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

  .select-delay-container {
    width: 100%;

    .details {
      margin-top: var(--padding);
      display: flex;
      justify-content: space-around;
    }
  }
</style>
