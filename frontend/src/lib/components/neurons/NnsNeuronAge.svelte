<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { secondsToDuration } from "@dfinity/utils";
  import { neuronAge } from "$lib/utils/neuron.utils";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let neuron: NeuronInfo;
</script>

<TestIdWrapper testId="nns-neuron-age-component">
  {#if neuron.ageSeconds > 0}
    <KeyValuePair>
      <span class="label" slot="key">{$i18n.neurons.age}</span>
      <span class="value" slot="value" data-tid="nns-neuron-age">
        {secondsToDuration({ seconds: neuronAge(neuron), i18n: $i18n.time })}
      </span>
    </KeyValuePair>
  {/if}
</TestIdWrapper>
