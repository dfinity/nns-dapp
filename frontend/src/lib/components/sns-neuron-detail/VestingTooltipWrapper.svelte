<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isVesting, vestingInSeconds } from "$lib/utils/sns-neuron.utils";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { Tooltip } from "@dfinity/gix-components";
  import type { SnsNeuron } from "@dfinity/sns";
  import { secondsToDuration } from "@dfinity/utils";

  export let neuron: SnsNeuron;
</script>

<TestIdWrapper testId="sns-neuron-vesting-tooltip-component">
  {#if isVesting(neuron)}
    <Tooltip
      id="sns-neuron-vesting-tooltip"
      text={replacePlaceholders(
        $i18n.sns_neuron_detail.vesting_period_tooltip,
        {
          $remainingVesting: secondsToDuration({
            seconds: vestingInSeconds(neuron),
            i18n: $i18n.time,
          }),
        }
      )}
    >
      <slot />
    </Tooltip>
  {:else}
    <slot />
  {/if}
</TestIdWrapper>
