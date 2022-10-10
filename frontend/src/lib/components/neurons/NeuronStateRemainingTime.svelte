<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { valueSpan } from "$lib/utils/utils";
  import Value from "$lib/components/ui/Value.svelte";

  export let state: NeuronState;
  export let timeInSeconds: bigint | undefined;
</script>

{#if timeInSeconds !== undefined}
  {#if state === NeuronState.Dissolving || state === NeuronState.Spawning}
    <p class="duration">
      {@html replacePlaceholders($i18n.neurons.remaining, {
        $duration: valueSpan(secondsToDuration(timeInSeconds)),
      })}
    </p>
  {:else if state === NeuronState.Locked}
    <p class="duration">
      <Value>{secondsToDuration(timeInSeconds)}</Value>
      - {$i18n.neurons.dissolve_delay_title}
    </p>
  {/if}
{/if}

<style lang="scss">
  p {
    margin: 0;
  }
</style>
