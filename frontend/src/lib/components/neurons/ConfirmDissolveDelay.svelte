<script lang="ts">
  import { tokenPriceStore } from "$lib/derived/token-price.derived";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { updateDelay } from "$lib/services/neurons.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { formatUsdValue } from "$lib/utils/format.utils";
  import {
    formatVotingPower,
    neuronPotentialVotingPower,
    neuronStake,
  } from "$lib/utils/neuron.utils";
  import { getUsdValue } from "$lib/utils/token.utils";
  import { busy } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import {
    ICPToken,
    isNullish,
    nonNullish,
    secondsToDuration,
    TokenAmountV2,
  } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";

  type Props = {
    delayInSeconds: bigint;
    neuron: NeuronInfo;
    confirmButtonText: string;
  };
  const { delayInSeconds, neuron, confirmButtonText }: Props = $props();

  const stake = $derived(
    TokenAmountV2.fromUlps({
      amount: neuronStake(neuron),
      token: ICPToken,
    })
  );
  const priceStore = $derived(tokenPriceStore(stake));
  const tokenPrice = $derived($priceStore);
  const stakeInFiat = $derived.by(() => {
    if (isNullish(stake) || isNullish(tokenPrice)) return undefined;
    const fiatValue = getUsdValue({ amount: stake, tokenPrice });
    return nonNullish(fiatValue) ? formatUsdValue(fiatValue) : undefined;
  });

  const dispatcher = createEventDispatcher();
  const updateNeuron = async () => {
    startBusyNeuron({ initiator: "update-delay", neuronId: neuron.neuronId });

    const neuronId = await updateDelay({
      neuronId: neuron.neuronId,
      dissolveDelayInSeconds: Number(
        delayInSeconds - neuron.dissolveDelaySeconds
      ),
    });

    stopBusy("update-delay");

    if (nonNullish(neuronId !== undefined)) dispatcher("nnsUpdated");
  };
</script>

<div class="wrapper" data-tid="confirm-dissolve-delay-container">
  <div class="main-info">
    <h3>{secondsToDuration({ seconds: delayInSeconds, i18n: $i18n.time })}</h3>
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <p class="value">{neuron.neuronId}</p>
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="neuron-stake" class="value">
      <AmountDisplay
        amount={stake}
        singleLine
        detailed
      />{#if nonNullish(stakeInFiat)}
        <span class="fiat" data-tid="fiat-value">
          (~{stakeInFiat})
        </span>
      {/if}
    </p>
  </div>
  <div class="voting-power">
    <p class="label">{$i18n.neurons.voting_power}</p>
    <p class="value">
      {formatVotingPower(
        neuronPotentialVotingPower({
          neuron,
          newDissolveDelayInSeconds: delayInSeconds,
        })
      )}
    </p>
  </div>
  <div class="toolbar">
    <button
      class="secondary"
      disabled={$busy}
      onclick={() => dispatcher("nnsBack")}
    >
      {$i18n.neurons.edit_delay}
    </button>
    <button
      class="primary"
      data-tid="confirm-delay-button"
      disabled={$busy}
      onclick={updateNeuron}
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

  .main-info {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--padding-3x);
  }

  .voting-power {
    flex-grow: 1;
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
