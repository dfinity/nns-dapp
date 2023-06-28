<script lang="ts">
  import Tooltip from "$lib/components/ui/Tooltip.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { secondsToDuration } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isVesting, vestingInSeconds } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let neuron: SnsNeuron;
</script>

<TestIdWrapper testId="sns-neuron-vesting-tooltip-component">
  {#if isVesting(neuron)}
    <Tooltip
      id="sns-neuron-vesting-tooltip"
      text={replacePlaceholders(
        $i18n.sns_neuron_detail.vesting_period_tooltip,
        {
          $remainingVesting: secondsToDuration(vestingInSeconds(neuron)),
        }
      )}
    >
      <slot />
    </Tooltip>
  {:else}
    <slot />
  {/if}
</TestIdWrapper>
