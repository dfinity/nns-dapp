<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { neuronAge } from "$lib/utils/sns-neuron.utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import { secondsToDuration } from "@dfinity/utils";

  export let neuron: SnsNeuron;

  let age: bigint;
  $: age = neuronAge(neuron);
</script>

<TestIdWrapper testId="sns-neuron-age-component">
  {#if age > 0}
    <KeyValuePair testId="sns-neuron-age">
      <span class="label" slot="key">{$i18n.neurons.age}</span>
      <span class="value" slot="value">
        {secondsToDuration({ seconds: age, i18n: $i18n.time })}
      </span>
    </KeyValuePair>
  {/if}
</TestIdWrapper>
