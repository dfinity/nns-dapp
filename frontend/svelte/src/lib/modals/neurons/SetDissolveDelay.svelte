<script lang="ts">
  import Card from "../../components/ui/Card.svelte";
  let EIGHT_YEARS = 60 * 60 * 24 * 365 * 8 + 60 * 60 * 24 * 2; // Extra two days for two leap years
  let delayInSeconds: number = 0;

  let backgroundStyle: string;
  $: {
    const firstHalf: number = Math.round((delayInSeconds / EIGHT_YEARS) * 100);
    backgroundStyle = `linear-gradient(90deg, var(--background-contrast) ${firstHalf}%, var(--gray-200) ${
      1 - firstHalf
    }%)`;
  }
</script>

<section>
  <div>
    <h5>Neuron ID</h5>
    <p>12312312312331223</p>
  </div>
  <div>
    <h5>Balance</h5>
    <p>1.10 ICP Stake</p>
  </div>
  <div>
    <h5>Current Dissolve Delay</h5>
    <p>0</p>
  </div>
  <Card>
    <div slot="start">
      <h5>Dissolve Delay</h5>
      <p>Voting power is given when neurons are locked for at least 6 months</p>
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
          <p>Voting Power</p>
        </div>
        <div>
          <h5>1 year, 59 days</h5>
          <p>Dissolve Delay</p>
        </div>
      </div>
    </div>
  </Card>
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
    -webkit-appearance: none;
    -moz-apperance: none;
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
    -webkit-appearance: none;
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
</style>
