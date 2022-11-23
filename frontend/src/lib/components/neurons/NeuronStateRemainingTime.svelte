<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { Html } from "@dfinity/gix-components";

  export let state: NeuronState;
  export let timeInSeconds: bigint | undefined;
  export let noBottomGap = false;
</script>

{#if timeInSeconds !== undefined}
  {#if state === NeuronState.Dissolving || state === NeuronState.Spawning}
    <p class="duration description" class:no-bottom-gap={noBottomGap}>
      <Html
        text={replacePlaceholders($i18n.neurons.remaining, {
          $duration: secondsToDuration(timeInSeconds),
        })}
      />
    </p>
  {:else if state === NeuronState.Locked}
    <p class="duration description" class:no-bottom-gap={noBottomGap}>
      {secondsToDuration(timeInSeconds)} – {$i18n.neurons.dissolve_delay_title}
    </p>
  {/if}
{/if}

<style lang="scss">
  .no-bottom-gap {
    margin: var(--padding) 0 0;
  }
</style>
