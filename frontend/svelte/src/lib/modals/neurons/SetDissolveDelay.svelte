<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import Card from "../../components/ui/Card.svelte";
  import Spinner from "../../components/ui/Spinner.svelte";
  import { SECONDS_IN_DAY, SECONDS_IN_YEAR } from "../../constants/constants";
  import { updateDelay } from "../../services/neurons.services";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";

  export let neuronId: NeuronId;

  let EIGHT_YEARS = SECONDS_IN_YEAR * 8;
  let SIX_MONTHS = (SECONDS_IN_DAY * 365) / 2;
  let delayInSeconds: number = 0;
  let loading: boolean = false;

  let backgroundStyle: string;
  $: {
    const firstHalf: number = Math.round((delayInSeconds / EIGHT_YEARS) * 100);
    backgroundStyle = `linear-gradient(90deg, var(--background-contrast) ${firstHalf}%, var(--gray-200) ${
      1 - firstHalf
    }%)`;
  }

  let disableUpdate: boolean;
  $: disableUpdate = delayInSeconds < SIX_MONTHS;
  const dispatcher = createEventDispatcher();
  const goToNext = (): void => {
    dispatcher("nnsNext");
  };

  const updateNeuron = async () => {
    loading = true;
    try {
      await updateDelay({
        neuronId,
        dissolveDelayInSeconds: delayInSeconds,
      });
      goToNext();
    } catch (error) {
      // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-329
      console.error(error);
    } finally {
      loading = false;
    }
  };
</script>

<section>
  <div>
    <h5>{$i18n.neurons.neuron_id}</h5>
    <p>{neuronId}</p>
  </div>
  <div>
    <h5>{$i18n.neurons.neuron_balance}</h5>
    <!-- TODO: Get Neuron info https://dfinity.atlassian.net/browse/L2-330 -->
    <p>1.10 ICP Stake</p>
  </div>
  <div>
    <h5>{$i18n.neurons.current_dissolve_delay}</h5>
    <!-- TODO: Get Neuron info https://dfinity.atlassian.net/browse/L2-330 -->
    <p>0</p>
  </div>
  <Card>
    <div slot="start">
      <h5>{$i18n.neurons.dissolve_delay_title}</h5>
      <p>{$i18n.neurons.dissolve_delay_description}</p>
    </div>
    <div class="select-delay-container">
      <input
        min={0}
        max={EIGHT_YEARS}
        type="range"
        bind:value={delayInSeconds}
        style={`background-image: ${backgroundStyle};`}
      />
      <div class="details">
        <div>
          <!-- TODO: Voting Power Calculation https://dfinity.atlassian.net/browse/L2-330 -->
          <h5>1.26</h5>
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
  <div class="buttons">
    <button on:click={goToNext} class="secondary full-width" disabled={loading}
      >{$i18n.neurons.skip}</button
    >
    <button
      class="primary full-width"
      disabled={disableUpdate || loading}
      on:click={updateNeuron}
      data-test="update-button"
    >
      {#if loading}
        <Spinner />
      {:else}
        {$i18n.neurons.update_delay}
      {/if}
    </button>
  </div>
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: calc(2 * var(--padding));
    padding: 0;
  }

  p {
    margin-top: 0;
  }

  .select-delay-container {
    width: 100%;

    input {
      width: 100%;
    }

    .details {
      margin-top: var(--padding);
      display: flex;
      justify-content: space-around;
    }
  }

  input[type="range"] {
    appearance: none;
    border-radius: 6px;
    height: 6px;
    width: 100%;
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]::-moz-focus-outer {
    border: 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    cursor: pointer;
    appearance: none;
  }

  input[type="range"]::-moz-range-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    cursor: pointer;
  }

  input[type="range"]::-ms-thumb {
    height: var(--icon-width);
    width: var(--icon-width);
    border-radius: 50%;
    background: var(--background-contrast);
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    cursor: pointer;
  }

  .buttons {
    display: flex;
    gap: var(--padding);
  }
</style>
