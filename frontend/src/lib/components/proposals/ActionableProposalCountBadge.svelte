<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Universe } from "$lib/types/universe";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isUniverseNns } from "$lib/utils/universe.utils";
  import { Tooltip, testSafeScale } from "@dfinity/gix-components";
  import { Principal } from "@dfinity/principal";
  import { cubicOut } from "svelte/easing";

  export let count: number;
  export let universe: Universe | "all";

  let tooltipText = "";
  $: tooltipText =
    universe === "all"
      ? // Total
        replacePlaceholders($i18n.voting.total_actionable_proposal_tooltip, {
          $count: `${count}`,
        })
      : isUniverseNns(Principal.fromText(universe.canisterId))
        ? // NNS
          replacePlaceholders($i18n.voting.nns_actionable_proposal_tooltip, {
            $count: `${count}`,
          })
        : // SNS
          replacePlaceholders($i18n.voting.sns_actionable_proposal_tooltip, {
            $count: `${count}`,
            $snsName: universe.title,
          });
</script>

<TestIdWrapper testId="actionable-proposal-count-badge-component">
  <Tooltip idPrefix="actionable-count-tooltip" text={tooltipText} top={true}
    ><span
      transition:testSafeScale={{
        duration: 250,
        easing: cubicOut,
      }}
      class="tag"
      role="status">{count}</span
    ></Tooltip
  >
</TestIdWrapper>

<style lang="scss">
  span {
    background: var(--primary);
    color: var(--primary-contrast);
    border-radius: var(--padding-8x);
    min-width: 7px;
    justify-content: center;
  }
</style>
