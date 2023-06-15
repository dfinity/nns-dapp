<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { ageSeconds } from "$lib/utils/sns-neuron.utils";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let neuron: SnsNeuron;

  let age: bigint;
  $: age = ageSeconds(neuron);
</script>

<TestIdWrapper testId="sns-neuron-age-component">
  {#if age > 0}
    <KeyValuePair testId="sns-neuron-age">
      <span class="label" slot="key">{$i18n.neurons.age}</span>
      <span class="value" slot="value">
        {secondsToDuration(age)}
      </span>
    </KeyValuePair>
  {/if}
</TestIdWrapper>
