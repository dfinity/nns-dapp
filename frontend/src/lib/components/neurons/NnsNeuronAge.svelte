<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { secondsToDate } from "$lib/utils/date.utils";

  export let neuron: NeuronInfo;

  // TODO: uncomment to activate display of neuron "Age"
</script>

<!--{#if neuron.ageSeconds > 0}-->
<!--  <KeyValuePair>-->
<!--    <span class="label" slot="key">{$i18n.neurons.age}</span>-->
<!--    <span class="value" slot="value">-->
<!--      {secondsToDuration(neuronAge(neuron))}-->
<!--    </span>-->
<!--  </KeyValuePair>-->
<!--{/if}-->

<KeyValuePair>
  <span class="label" slot="key">{$i18n.neurons.staked}</span>
  <span class="value" slot="value">
    {secondsToDate(Number(neuron.createdTimestampSeconds))}
  </span>
</KeyValuePair>
