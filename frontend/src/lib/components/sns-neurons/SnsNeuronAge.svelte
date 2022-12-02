<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";

  // TODO: remove svelte ignore for svelte-check once implemented
  // svelte-ignore unused-export-let
  export let neuron: SnsNeuron;

  // TODO: implement Sns neuron Age
  // Pseudo code:
  // const snsNeuronAge = Math.min(queryAndUpdate(sns_gov).param.max_neuron_age_for_age_bonus, now - neuron.aging_since_timestamp_seconds);

  // let age: bigint;
  // $: age = BigInt(nowInSeconds()) - neuron.created_timestamp_seconds;
</script>

<!--{#if age > 0}-->
<!--  <KeyValuePair>-->
<!--    <span class="label" slot="key">{$i18n.neurons.age}</span>-->
<!--    <span class="value" slot="value" data-tid="sns-neuron-age">-->
<!--      {secondsToDuration(age)}-->
<!--    </span>-->
<!--  </KeyValuePair>-->
<!--{/if}-->
