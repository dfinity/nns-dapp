<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "@dfinity/utils";
  import { isVesting, vestingInSeconds } from "$lib/utils/sns-neuron.utils";

  export let neuron: SnsNeuron;
</script>

<TestIdWrapper testId="sns-vesting-period-remaining-component">
  {#if isVesting(neuron)}
    <KeyValuePair testId="sns-neuron-vesting-period">
      <span class="label" slot="key">{$i18n.neurons.vestion_period}</span>
      <span class="value" slot="value">
        {secondsToDuration({
          seconds: vestingInSeconds(neuron),
          i18n: $i18n.time,
        })}
      </span>
    </KeyValuePair>
  {/if}
</TestIdWrapper>
