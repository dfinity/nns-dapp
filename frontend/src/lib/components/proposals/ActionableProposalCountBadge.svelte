<script lang="ts" context="module">
  let nextTooltipIdNumber = 0;
</script>

<script lang="ts">
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { Tooltip } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isUniverseNns } from "$lib/utils/universe.utils";
  import type { Universe } from "$lib/types/universe";
  import { Principal } from "@dfinity/principal";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let count: number;
  export let universe: Universe | "all";
  export let noAnimation = false;

  let tooltipId = `actionable-count-tooltip-${nextTooltipIdNumber++}`;

  let isTotal = false;
  $: isTotal = universe === "all";

  let tooltipText = "";
  $: tooltipText = isTotal
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

  // Always rerender to trigger animation start
  let mounted = false;
  onMount(() => (mounted = true));
</script>

<TestIdWrapper testId="actionable-proposal-count-badge-component">
  {#if noAnimation || mounted}
    <Tooltip id={tooltipId} text={tooltipText} top={true}
      ><span
        transition:scale={{
          duration: 250,
          easing: cubicOut,
        }}
        class="tag"
        role="status">{count}</span
      ></Tooltip
    >
  {/if}
</TestIdWrapper>

<style lang="scss">
  span {
    background: var(--primary);
    color: var(--primary-contrast);
    border-radius: var(--padding-8x);
  }
</style>
