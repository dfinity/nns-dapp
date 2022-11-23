<script lang="ts">
  import type { NeuronState, Token } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { nowInSeconds, secondsToDuration } from "$lib/utils/date.utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { Html, InputRange } from "@dfinity/gix-components";
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
  import type { NervousSystemParameters } from "@dfinity/sns/dist/candid/sns_governance";
  import { fromDefinedNullable } from "@dfinity/utils";
  import Hash from "$lib/components/ui/Hash.svelte";
  import NeuronStateRemainingTime from "$lib/components/neurons/NeuronStateRemainingTime.svelte";

  export let neuron: SnsNeuron;
  export let token: Token;
  export let delayInSeconds = 0; // bound
  export let minDelayInSeconds = 0;

  const checkMinimum = () => {
    if (delayInSeconds < minDelayInSeconds) {
      delayInSeconds = minDelayInSeconds;
    }
  };

  let neuronState: NeuronState;
  $: neuronState = getSnsNeuronState(neuron);

  let neuronStake: bigint;
  $: neuronStake = getSnsNeuronStake(neuron);

  let dissolveDelaySeconds: bigint;
  $: dissolveDelaySeconds = getSnsLockedTimeInSeconds(neuron) ?? 0n;

  let snsParameters: NervousSystemParameters | undefined;
  $: snsParameters = $snsProjectParametersStore?.parameters;

  let maxDissolveDelaySeconds: number | undefined;
  $: maxDissolveDelaySeconds =
    snsParameters === undefined
      ? undefined
      : Number(fromDefinedNullable(snsParameters?.max_dissolve_delay_seconds));

  let minDissolveDelaySeconds: number | undefined;
  $: minDissolveDelaySeconds =
    snsParameters === undefined
      ? undefined
      : Number(
          fromDefinedNullable(
            snsParameters?.neuron_minimum_dissolve_delay_to_vote_seconds
          )
        );

  let votingPower: number | undefined;
  $: if (neuron !== undefined && snsParameters !== undefined) {
    votingPower = snsVotingPower({
      nowSeconds: nowInSeconds(),
      dissolveDelayInSeconds: delayInSeconds,
      neuron,
      snsParameters,
    });
  }

  let disableUpdate: boolean;
  $: disableUpdate =
    delayInSeconds < (minDissolveDelaySeconds ?? 0) ||
    delayInSeconds <= minDelayInSeconds;
  const dispatcher = createEventDispatcher();
  const cancel = (): void => {
    dispatcher("nnsCancel");
  };

  const goToConfirmation = async () => {
    dispatcher("nnsConfirmDelay");
  };
</script>

<div class="wrapper">
  <div>
    <p class="label">{$i18n.neurons.neuron_id}</p>
    <Hash
      id="neuron-id"
      tagName="p"
      testId="neuron-id"
      text={getSnsNeuronIdAsHexString(neuron)}
    />
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

  {#if dissolveDelaySeconds}
    <div>
      <p class="label">{$i18n.neurons.current_dissolve_delay}</p>
      <NeuronStateRemainingTime
        state={neuronState}
        timeInSeconds={dissolveDelaySeconds}
      />
    </div>
  {/if}

  <div>
    <p class="label">{$i18n.neurons.dissolve_delay_title}</p>
    <p class="description">{$i18n.neurons.dissolve_delay_description}</p>

    <div class="select-delay-container">
      <!-- TODO: replace with disabled state-->
      {#if maxDissolveDelaySeconds !== undefined}
        <InputRange
          ariaLabel={$i18n.neuron_detail.dissolve_delay_range}
          min={0}
          max={maxDissolveDelaySeconds}
          bind:value={delayInSeconds}
          handleInput={checkMinimum}
        />
      {/if}
      <div class="details">
        <div>
          <p class="label">
            {#if votingPower !== undefined}
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
