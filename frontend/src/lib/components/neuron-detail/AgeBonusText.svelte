<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import Tooltip from "../ui/Tooltip.svelte";

  export let ageMultiplier: number;
</script>

<Tooltip
  testId="age-bonus-text-component"
  id="neuron-age-bonus"
  text={formatPercentage(ageMultiplier - 1)}
>
  <span data-tid="age-bonus-text">
    {replacePlaceholders($i18n.neuron_detail.age_bonus_label, {
      $ageBonus: formatPercentage(ageMultiplier - 1, {
        minFraction: 0,
        maxFraction: 0,
      }),
    })}
  </span>
</Tooltip>
