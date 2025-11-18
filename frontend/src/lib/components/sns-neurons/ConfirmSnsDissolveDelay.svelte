<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import { snsParametersStore } from "$lib/derived/sns-parameters.derived";
  import { tokenPriceStore } from "$lib/derived/token-price.derived";
  import { i18n } from "$lib/stores/i18n";
  import { formatUsdValue } from "$lib/utils/format.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import {
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    snsNeuronVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import { getUsdValue } from "$lib/utils/token.utils";
  import { busy } from "@dfinity/gix-components";
  import type { Principal } from "@icp-sdk/core/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    isNullish,
    nonNullish,
    secondsToDuration,
    TokenAmountV2,
    type Token,
  } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  type Props = {
    rootCanisterId: Principal;
    neuron: SnsNeuron;
    token: Token;
    delayInSeconds: number;
  };

  const { rootCanisterId, neuron, token, delayInSeconds }: Props = $props();

  const neuronStake = $derived(
    TokenAmountV2.fromUlps({
      amount: getSnsNeuronStake(neuron),
      token,
    })
  );
  const neuronId = $derived(getSnsNeuronIdAsHexString(neuron));
  const snsParameters = $derived(
    $snsParametersStore[rootCanisterId.toText()]?.parameters
  );
  const votingPower = $derived(
    nonNullish(neuron) && nonNullish(snsParameters)
      ? snsNeuronVotingPower({
          newDissolveDelayInSeconds: BigInt(delayInSeconds),
          neuron,
          snsParameters,
        })
      : undefined
  );

  const priceStore = $derived(tokenPriceStore(neuronStake.token));
  const tokenPrice = $derived($priceStore);
  const neuronStakeInFiat = $derived.by(() => {
    if (isNullish(neuronStake) || isNullish(tokenPrice)) return undefined;
    const fiatValue = getUsdValue({ amount: neuronStake, tokenPrice });
    return nonNullish(fiatValue) ? formatUsdValue(fiatValue) : undefined;
  });

  const dispatcher = createEventDispatcher();
</script>

<div class="wrapper" data-tid="confirm-dissolve-delay-container">
  <div class="main-info">
    <h3 data-tid="dissolve-delay">
      {secondsToDuration({ seconds: BigInt(delayInSeconds), i18n: $i18n.time })}
    </h3>
  </div>
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <Hash id="neuron-id" tagName="p" testId="neuron-id" text={neuronId} />
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
  <div class="voting-power">
    <p class="label">{$i18n.neurons.voting_power}</p>
    <p class="value" data-tid="voting-power">
      {#if votingPower !== undefined}
        {formatVotingPower(votingPower)}
      {/if}
    </p>
  </div>
  <div class="toolbar">
    <button
      data-tid="edit-delay-button"
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
      onclick={() => dispatcher("nnsConfirm")}
    >
      {$i18n.neurons.confirm_update_delay}
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
