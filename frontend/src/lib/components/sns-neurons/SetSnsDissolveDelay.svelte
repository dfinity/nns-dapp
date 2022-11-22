<script lang="ts">
  import { NeuronState, type Token } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import {
    SECONDS_IN_EIGHT_YEARS,
    SECONDS_IN_HALF_YEAR,
  } from "$lib/constants/constants";
  import { i18n } from "$lib/stores/i18n";
  import {nowInSeconds, secondsToDuration} from "$lib/utils/date.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { InputRange, Html } from "@dfinity/gix-components";
  import { valueSpan } from "$lib/utils/utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import {
    getSnsLockedTimeInSeconds,
    getSnsNeuronIdAsHexString,
    getSnsNeuronStake,
    getSnsNeuronState,
    snsVotingPower,
  } from "$lib/utils/sns-neuron.utils";
  import { snsProjectParametersStore } from "$lib/derived/sns/sns-project-parameters.derived";
  import type { SnsParameters } from "$lib/stores/sns-parameters.store";

  export let neuron: SnsNeuron;
  export let token: Token;
  export let delayInSeconds = 0; // bound
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

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);

  let neuronStake: bigint;
  $: neuronStake = getSnsNeuronStake(neuron);

  let dissolveDelaySeconds: bigint;
  $: dissolveDelaySeconds = getSnsLockedTimeInSeconds(neuron) ?? 0n;

  let snsParameters: SnsParameters | undefined;
  $: snsParameters = $snsProjectParametersStore;

  let votingPower: number | undefined;
  $: if (neuron !== undefined && $snsProjectParametersStore !== undefined) {
    votingPower = snsVotingPower({
      nowSeconds: nowInSeconds(),
      stake: Number(neuronStake),
      dissolveDelayInSeconds: delayInSeconds,
      neuron,
      snsParameters: $snsProjectParametersStore.parameters,
    });
  }

  const goToConfirmation = async () => {
    dispatcher("nnsConfirmDelay");
  };
</script>

<div class="wrapper">
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <p class="value">{getSnsNeuronIdAsHexString(neuron)}</p>
  </div>

  <div>
    <p class="label">{$i18n.neurons.neuron_balance}</p>
    <p data-tid="neuron-stake">
      <Html
        text={replacePlaceholders($i18n.sns_neurons.token_stake, {
          $amount: valueSpan(
            formatToken({ value: neuronStake, detailed: true })
          ),
          $token: token.symbol,
        })}
      />
    </p>
  </div>

  {#if neuronState === NeuronState.Locked && dissolveDelaySeconds !== undefined}
    <div>
      <p class="label">{$i18n.neurons.current_dissolve_delay}</p>
      <p class="duration">
        <Html
          text={`${valueSpan(secondsToDuration(dissolveDelaySeconds))} - ${
            $i18n.neurons.staked
          }`}
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
            {#if votingPower}
              {formatVotingPower(votingPower)}
            {/if}
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
      >{$i18n.core.cancel}</button
    >
    <button
      class="primary"
      disabled={disableUpdate}
      on:click={goToConfirmation}
      data-tid="go-confirm-delay-button"
    >
      {$i18n.neurons.update_delay}
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
