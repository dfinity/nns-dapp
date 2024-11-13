<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import { Tooltip } from "@dfinity/gix-components";
  import { cubicOut } from "svelte/easing";
  import { scale } from "svelte/transition";

  export let status: UniversalProposalStatus;
  export let actionable: boolean | undefined = undefined;

  let label: string;
  $: label = $i18n.universal_proposal_status[status];
</script>

<div data-tid="proposal-status-tag" class={`tag ${status}`}>
  {label}<TestIdWrapper testId="actionable-status-badge">
    {#if actionable}
      <div class="actionable-status-container">
        <Tooltip
          id="actionable-status-tooltip"
          text={$i18n.voting.is_actionable_status_badge_tooltip}
          top={true}
        >
          <div
            class="actionable-status-badge"
            role="status"
            transition:scale={{ duration: 250, easing: cubicOut }}
          />
        </Tooltip>
      </div>
    {/if}
  </TestIdWrapper>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .tag {
    position: relative;

    &.unknown {
      color: var(--tag-text);
      background-color: var(--tag-background);
    }
    &.open {
      color: var(--tag-open-text);
      background-color: var(--tag-open-background);
    }
    &.rejected {
      color: var(--tag-rejected-text);
      background-color: var(--tag-rejected-background);
    }
    &.adopted {
      color: var(--tag-adopted-text);
      background-color: var(--tag-adopted-background);
    }
    &.executed {
      color: var(--tag-executed-text);
      background-color: var(--tag-executed-background);
    }
    &.failed {
      color: var(--tag-failed-text);
      background-color: var(--tag-failed-background);
    }

    // Because of Tooltip wrapper the badge needs a container for positioning.
    .actionable-status-container {
      position: absolute;
      top: calc(-1 * var(--padding-0_5x));
      right: calc(-1 * var(--padding-0_5x));
    }
    .actionable-status-badge {
      width: var(--padding-1_5x);
      height: var(--padding-1_5x);

      box-sizing: border-box;
      border: 1.5px solid var(--card-background);
      border-radius: var(--padding-1_5x);
      background: var(--primary);
    }
  }
</style>
