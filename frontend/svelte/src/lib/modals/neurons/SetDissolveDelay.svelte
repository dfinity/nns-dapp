<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import Card from "../../components/ui/Card.svelte";
  import { SECONDS_IN_DAY, SECONDS_IN_YEAR } from "../../constants/constants";
  import { i18n } from "../../stores/i18n";
  import { secondsToDuration } from "../../utils/date.utils";
  let EIGHT_YEARS = SECONDS_IN_YEAR * 8;
  let SIX_MONTHS = (SECONDS_IN_DAY * 365) / 2;
  let delayInSeconds: number = 0;

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
  const skip = () => {
    dispatcher("nnsNext");
  };
</script>

<section>
  <div>
    <h5>{$i18n.neurons.neuron_id}</h5>
    <p>12312312312331223</p>
  </div>
  <div>
    <h5>{$i18n.neurons.neuron_balance}</h5>
    <p>1.10 ICP Stake</p>
  </div>
  <div>
    <h5>{$i18n.neurons.current_dissolve_delay}</h5>
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
    <button on:click={skip} class="secondary full-width"
      >{$i18n.neurons.skip}</button
    >
    <button
      class="primary full-width"
      disabled={disableUpdate}
      data-test="update-button">{$i18n.neurons.update_delay}</button
    >
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
