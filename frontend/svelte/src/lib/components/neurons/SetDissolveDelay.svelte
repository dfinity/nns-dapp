<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import Card from "../ui/Card.svelte";
  import {
    SECONDS_IN_EIGHT_YEARS,
    SECONDS_IN_HALF_YEAR,
  } from "../../constants/constants";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  import { formatICP } from "../../utils/icp.utils";
  import {
    formatVotingPower,
    neuronStake,
    votingPower,
  } from "../../utils/neuron.utils";
  import { replacePlaceholders } from "../../utils/i18n.utils";
  import InputRange from "../ui/InputRange.svelte";

  export let neuron: NeuronInfo;
  export let delayInSeconds: number = 0;
  export let cancelButtonText: string | undefined = undefined;
  export let confirmButtonText: string;
  export let minDelayInSeconds: number = 0;

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

<div class="wizard-wrapper wrapper">
  <div>
    <h5>{$i18n.neurons.neuron_id}</h5>
    <p>{neuron.neuronId}</p>

    <h5>{$i18n.neurons.neuron_balance}</h5>
    <p data-tid="neuron-stake">
      {replacePlaceholders($i18n.neurons.icp_stake, {
        $amount: formatICP({ value: neuronICP, detailed: true }),
      })}
    </p>

    {#if neuron.state === NeuronState.LOCKED && neuron.dissolveDelaySeconds}
      <h5>{$i18n.neurons.current_dissolve_delay}</h5>
      <p class="duration">
        {secondsToDuration(neuron.dissolveDelaySeconds)} - {$i18n.neurons
          .staked}
      </p>
    {/if}
  </div>

  <div class="delay">
    <Card>
      <div slot="start">
        <h5>{$i18n.neurons.dissolve_delay_title}</h5>
        <p>{$i18n.neurons.dissolve_delay_description}</p>
      </div>
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
            <h5>
              {formatVotingPower(
                votingPower({
                  stake: neuronICP,
                  dissolveDelayInSeconds: delayInSeconds,
                })
              )}
            </h5>
            <p>{$i18n.neurons.voting_power}</p>
          </div>
          <div>
            {#if delayInSeconds > 0}
              <h5>{secondsToDuration(BigInt(delayInSeconds))}</h5>
            {:else}
              <h5>{$i18n.neurons.no_delay}</h5>
            {/if}
            <p>{$i18n.neurons.dissolve_delay_title}</p>
          </div>
        </div>
      </div>
    </Card>
  </div>

  <div class="buttons">
    {#if cancelButtonText !== undefined}
      <button
        on:click={cancel}
        data-tid="cancel-neuron-delay"
        class="secondary full-width">{cancelButtonText}</button
      >
    {/if}
    <button
      class="primary full-width"
      disabled={disableUpdate}
      on:click={goToConfirmation}
      data-tid="go-confirm-delay-button"
    >
      {confirmButtonText}
    </button>
  </div>
</div>

<style lang="scss">
  p {
    margin-top: 0;
  }

  .select-delay-container {
    width: 100%;

    .details {
      margin-top: var(--padding);
      display: flex;
      justify-content: space-around;
    }
  }

  .buttons {
    display: flex;
    gap: var(--padding);
    padding: 0 0 var(--padding-2x);
  }

  .delay {
    flex-grow: 1;
  }
</style>
