<script lang="ts">
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import DayInput from "$lib/components/ui/DayInput.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { valueSpan } from "$lib/utils/utils";
  import RangeDissolveDelay from "$lib/components/neurons/RangeDissolveDelay.svelte";
  import { Html } from "@dfinity/gix-components";
  import type { NeuronState } from "@dfinity/nns";
  import { nonNullish, type TokenAmountV2 } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let neuronState: NeuronState;
  export let neuronDissolveDelaySeconds: bigint;
  export let neuronStake: TokenAmountV2;
  export let delayInSeconds = 0;
  export let minProjectDelayInSeconds: number;
  export let maxDelayInSeconds = 0;
  // sns and nns calculates voting power differently
  export let calculateVotingPower: (delayInSeconds: number) => number;
  export let minDissolveDelayDescription = "";

  const dispatch = createEventDispatcher();

  let votingPower: number;
  $: votingPower = calculateVotingPower(delayInSeconds);

  let disableUpdate: boolean;
  $: disableUpdate = shouldUpdateBeDisabled(delayInSeconds);

  let warningMessage: string | undefined;
  $: warningMessage =
    delayInSeconds > 0 && delayInSeconds < minProjectDelayInSeconds
      ? $i18n.neurons.dissolve_delay_below_minimum
      : undefined;

  const getInputError = (delayInSeconds: number) => {
    if (delayInSeconds > maxDelayInSeconds) {
      return $i18n.neurons.dissolve_delay_above_maximum;
    }
    if (delayInSeconds <= neuronDissolveDelaySeconds) {
      return $i18n.neurons.dissolve_delay_below_current;
    }
    return undefined;
  };

  const shouldUpdateBeDisabled = (delayInSeconds: number): boolean => {
    return nonNullish(getInputError(delayInSeconds));
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
            formatTokenV2({ value: neuronStake, detailed: true })
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
    <p class="description" data-tid="description">
      {replacePlaceholders($i18n.neurons.dissolve_delay_description, {
        $token: neuronStake.token.symbol,
      })}
    </p>
    <p class="description" data-tid="min-dissolve-delay-description">
      {minDissolveDelayDescription}
    </p>
  </div>
  <div class="select-delay-container">
    <p class="subtitle">{$i18n.neurons.dissolve_delay_label}</p>
    <div>
      <DayInput
        bind:seconds={delayInSeconds}
        disabled={Number(neuronDissolveDelaySeconds) === maxDelayInSeconds}
        maxInSeconds={maxDelayInSeconds}
        minInSeconds={Math.max(
          Number(neuronDissolveDelaySeconds) + 1,
          minProjectDelayInSeconds
        )}
        placeholderLabelKey="neurons.dissolve_delay_placeholder"
        name="dissolve_delay"
        {getInputError}
        {warningMessage}
      />
    </div>
    <div class="range">
      <RangeDissolveDelay {maxDelayInSeconds} {delayInSeconds} {votingPower} />
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
  }
</style>
