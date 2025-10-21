<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";
  import RangeDissolveDelay from "$lib/components/neurons/RangeDissolveDelay.svelte";
  import DayInput from "$lib/components/ui/DayInput.svelte";
  import { tokenPriceStore } from "$lib/derived/token-price.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatUsdValue } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { getUsdValue } from "$lib/utils/token.utils";
  import type { NeuronState } from "@icp-sdk/canisters/nns";
  import { isNullish, nonNullish, type TokenAmountV2 } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  type Props = {
    neuronState: NeuronState;
    neuronDissolveDelaySeconds: bigint;
    neuronStake: TokenAmountV2;
    delayInSeconds?: number;
    minProjectDelayInSeconds: number;
    maxDelayInSeconds?: number;
    // sns and nns calculates voting power differently
    calculateVotingPower: (delayInSeconds: number) => number;
    minDissolveDelayDescription?: string;
  };

  let {
    neuronState,
    neuronDissolveDelaySeconds,
    neuronStake,
    delayInSeconds = $bindable(0),
    minProjectDelayInSeconds,
    maxDelayInSeconds = 0,
    calculateVotingPower,
    minDissolveDelayDescription = "",
  }: Props = $props();

  const getInputError = (delayInSeconds: number) => {
    if (delayInSeconds > maxDelayInSeconds)
      return $i18n.neurons.dissolve_delay_above_maximum;
    if (delayInSeconds <= neuronDissolveDelaySeconds)
      return $i18n.neurons.dissolve_delay_below_current;

    return undefined;
  };

  const dispatch = createEventDispatcher();

  const votingPower = $derived(calculateVotingPower(delayInSeconds));
  const disableUpdate = $derived(nonNullish(getInputError(delayInSeconds)));
  const warningMessage = $derived(
    delayInSeconds > 0 && delayInSeconds < minProjectDelayInSeconds
      ? $i18n.neurons.dissolve_delay_below_minimum
      : undefined
  );

  const priceStore = $derived(tokenPriceStore(neuronStake.token));
  const tokenPrice = $derived($priceStore);
  const neuronStakeInFiat = $derived.by(() => {
    if (isNullish(neuronStake) || isNullish(tokenPrice)) return undefined;
    const fiatValue = getUsdValue({ amount: neuronStake, tokenPrice });
    return nonNullish(fiatValue) ? formatUsdValue(fiatValue) : undefined;
  });

  const cancel = () => dispatch("nnsCancel");
  const goToConfirmation = () => dispatch("nnsConfirmDelay");
</script>

<div class="wrapper" data-tid="set-dissolve-delay-component">
  <!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
  <!-- svelte-ignore slot_element_deprecated -->
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <slot name="neuron-id" />
  </div>

  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="neuron-stake" class="value">
      <AmountDisplay
        amount={neuronStake}
        singleLine
        detailed
      />{#if nonNullish(neuronStakeInFiat)}
        <span class="fiat" data-tid="fiat-value">
          (~{neuronStakeInFiat})
        </span>
      {/if}
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
    <!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
    <!-- svelte-ignore slot_element_deprecated -->
    <button onclick={cancel} data-tid="cancel-neuron-delay" class="secondary"
      ><slot name="cancel" /></button
    >
    <!-- eslint-disable-next-line svelte/no-unused-svelte-ignore -->
    <!-- svelte-ignore slot_element_deprecated -->
    <button
      class="primary"
      disabled={disableUpdate}
      onclick={goToConfirmation}
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

  .value {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    .fiat {
      color: var(--text-description);
    }
  }
</style>
