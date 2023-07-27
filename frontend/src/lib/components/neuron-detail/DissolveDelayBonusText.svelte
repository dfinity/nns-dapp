<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import Tooltip from "../ui/Tooltip.svelte";

  export let dissolveBonus: number;
</script>

<Tooltip
  testId="dissolve-delay-bonus-text-component"
  id="neuron-dissolve-delay-bonus"
  text={formatPercentage(dissolveBonus - 1)}
>
  <span data-tid="dissolve-bonus-text">
    {replacePlaceholders($i18n.neuron_detail.dissolve_bonus_label, {
      $dissolveBonus: formatPercentage(dissolveBonus - 1, {
        minFraction: 0,
        maxFraction: 0,
      }),
    })}
  </span>
</Tooltip>
