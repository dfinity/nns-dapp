<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { neuronAge } from "$lib/utils/neuron.utils";

  export let neuron: NeuronInfo;
</script>

{#if neuron.ageSeconds > 0}
  <KeyValuePair>
    <span class="label" slot="key">{$i18n.neurons.age}</span>
    <span class="value" slot="value">
      {secondsToDuration(neuronAge(neuron))}
    </span>
  </KeyValuePair>
{/if}
