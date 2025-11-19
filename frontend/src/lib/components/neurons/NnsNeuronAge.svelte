<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { neuronAge } from "$lib/utils/neuron.utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@icp-sdk/canisters/nns";
  import { secondsToDuration } from "@dfinity/utils";

  export let neuron: NeuronInfo;
</script>

<TestIdWrapper testId="nns-neuron-age-component">
  {#if neuron.ageSeconds > 0}
    <KeyValuePair>
      {#snippet key()}<span class="label">{$i18n.neurons.age}</span>{/snippet}
      {#snippet value()}<span class="value" data-tid="nns-neuron-age">
          {secondsToDuration({ seconds: neuronAge(neuron), i18n: $i18n.time })}
        </span>{/snippet}
    </KeyValuePair>
  {/if}
</TestIdWrapper>
