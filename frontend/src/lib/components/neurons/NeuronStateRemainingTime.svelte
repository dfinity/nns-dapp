<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { Html, KeyValuePair } from "@dfinity/gix-components";

  export let state: NeuronState;
  export let timeInSeconds: bigint | undefined;
  export let inline = true;
</script>

{#if timeInSeconds !== undefined}
  {#if state === NeuronState.Dissolving || state === NeuronState.Spawning}
    {#if inline}
    <p class="duration description">
      <Html
              text={replacePlaceholders($i18n.neurons.inline_remaining, {
          $duration: secondsToDuration(timeInSeconds),
        })}
      />
    </p>
      {:else}
      <KeyValuePair>
        <span slot="key" class="label">{$i18n.neurons.remaining}</span>
        <span slot="value" class="value">{secondsToDuration(timeInSeconds)}</span>
      </KeyValuePair>
      {/if}
  {:else if state === NeuronState.Locked}
    {#if inline}
    <p class="duration description">
      {secondsToDuration(timeInSeconds)} – {$i18n.neurons.dissolve_delay_title}
    </p>
      {:else}
      <KeyValuePair>
        <span slot="key" class="label">{$i18n.neurons.dissolve_delay_title}</span>
        <span slot="value" class="value">{secondsToDuration(timeInSeconds)}</span>
      </KeyValuePair>
      {/if}
  {/if}
{/if}

<style lang="scss">
  p {
    margin: var(--padding) 0 0;
  }
</style>