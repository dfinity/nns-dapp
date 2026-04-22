<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { formatDissolveDelay } from "$lib/utils/date.utils";
  import { formatVotingPower } from "$lib/utils/neuron.utils";
  import { ProgressBar } from "@dfinity/gix-components";

  export let delayInSeconds: number;
  export let maxDelayInSeconds: number;
  export let votingPower: number;
</script>

<TestIdWrapper testId="range-dissolve-delay-component">
  <ProgressBar
    testId="range-dissolve-delay-progress-bar"
    max={maxDelayInSeconds}
    value={delayInSeconds}
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
        <!-- Math.round guards against BigInt() throwing on non-integer numbers -->
        <p class="label"
          >{formatDissolveDelay(BigInt(Math.round(delayInSeconds)))}</p
        >
      {:else}
        <p class="label">{$i18n.neurons.no_delay}</p>
      {/if}
      <p>{$i18n.neurons.dissolve_delay_title}</p>
    </div>
  </div>
</TestIdWrapper>

<style lang="scss">
  .details {
    margin-top: var(--padding);
    display: flex;
    justify-content: space-around;
  }
</style>
