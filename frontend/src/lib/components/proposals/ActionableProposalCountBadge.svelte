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
  export let universe: Universe;

  let tooltipText = "";
  $: tooltipText = isUniverseNns(Principal.fromText(universe.canisterId))
    ? $i18n.voting.nns_actionable_proposal_tooltip
    : $i18n.voting.sns_actionable_proposal_tooltip;

  // Always rerender to trigger animation start
  let mounted = false;
  onMount(() => (mounted = true));
</script>

{#if mounted}
  <TestIdWrapper testId="actionable-proposal-count-badge-component">
    <Tooltip
      id="actionable-count-tooltip"
      text={replacePlaceholders(tooltipText, {
        $count: count,
        $snsName: universe.title,
      })}
      top={true}
    >
      <span
        transition:scale={{
          duration: 250,
          easing: cubicOut,
        }}
        class="tag">{count}</span
      >
    </Tooltip>
  </TestIdWrapper>
{/if}

<style lang="scss">
  span {
    background: var(--primary);
    color: var(--primary-contrast);
    border-radius: var(--padding-8x);
  }
</style>
