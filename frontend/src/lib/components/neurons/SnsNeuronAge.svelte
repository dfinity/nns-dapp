<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { nowInSeconds, secondsToDuration } from "$lib/utils/date.utils";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;

  let age: bigint;
  $: age = BigInt(nowInSeconds()) - neuron.created_timestamp_seconds;
</script>

{#if age > 0}
  <KeyValuePair>
    <span class="label" slot="key">{$i18n.neurons.age}</span>
    <span class="value" slot="value">
      {secondsToDuration(age)}
    </span>
  </KeyValuePair>
{/if}
