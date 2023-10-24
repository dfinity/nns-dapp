<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { daysToDuration, secondsToDays } from "$lib/utils/date.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { InputRange } from "@dfinity/gix-components";

  export let delayInSeconds: number;
  export let maxDelayInSeconds: number;
  export let onRangeInput: () => void;
  export let votingPower: number;

  let delayInDays: number;
  $: delayInDays = secondsToDays(delayInSeconds);
</script>

<InputRange
  ariaLabel={$i18n.neuron_detail.dissolve_delay_range}
  min={0}
  max={maxDelayInSeconds}
  bind:value={delayInSeconds}
  handleInput={onRangeInput}
/>
<div class="details">
  <div>
    <p class="label">
      {formatVotingPower(votingPower)}
    </p>
    <p>{$i18n.neurons.voting_power}</p>
  </div>
  <div>
    {#if delayInSeconds > 0}
      <p class="label">{daysToDuration(delayInDays)}</p>
    {:else}
      <p class="label">{$i18n.neurons.no_delay}</p>
    {/if}
    <p>{$i18n.neurons.dissolve_delay_title}</p>
  </div>
</div>

<style lang="scss">
  .details {
    margin-top: var(--padding);
    display: flex;
    justify-content: space-around;
  }
</style>
