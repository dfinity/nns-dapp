<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { Card } from "@dfinity/gix-components";
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
  import FooterModal from "../../modals/FooterModal.svelte";
  import { valueSpan } from "../../utils/utils";

  export let neuron: NeuronInfo;
  export let delayInSeconds: number = 0;
  export let cancelButtonText: string;
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
    <p class="value">{neuron.neuronId}</p>

    <h5>{$i18n.neurons.neuron_balance}</h5>
    <p data-tid="neuron-stake">
      {@html replacePlaceholders($i18n.neurons.icp_stake, {
        $amount: valueSpan(formatICP({ value: neuronICP, detailed: true })),
      })}
    </p>

    {#if neuron.state === NeuronState.Locked && neuron.dissolveDelaySeconds}
      <h5>{$i18n.neurons.current_dissolve_delay}</h5>
      <p class="duration">
        {@html valueSpan(secondsToDuration(neuron.dissolveDelaySeconds))} - {$i18n
          .neurons.staked}
      </p>
    {/if}
  </div>

  <div class="delay">
    <Card>
      <div slot="start">
        <h5>{$i18n.neurons.dissolve_delay_title}</h5>
        <p class="description">{$i18n.neurons.dissolve_delay_description}</p>
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

  <FooterModal>
    <button
      on:click={cancel}
      data-tid="cancel-neuron-delay"
      class="secondary small">{cancelButtonText}</button
    >
    <button
      class="primary small"
      disabled={disableUpdate}
      on:click={goToConfirmation}
      data-tid="go-confirm-delay-button"
    >
      {confirmButtonText}
    </button>
  </FooterModal>
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

  .delay {
    flex-grow: 1;
  }
</style>
