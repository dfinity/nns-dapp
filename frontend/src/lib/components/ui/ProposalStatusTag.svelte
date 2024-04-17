<script lang="ts">
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import { i18n } from "$lib/stores/i18n";
  import { Tooltip } from "@dfinity/gix-components";
  import { cubicOut } from "svelte/easing";
  import { scale } from "svelte/transition";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

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
      color: var(--disable-contrast);
      background-color: var(--disable);
    }
    &.open {
      color: var(--green);
      background-color: var(--green-tint);

      @include media.dark-theme {
        background-color: var(--green-dark);
      }
    }
    &.rejected {
      color: var(--pink);
      background-color: var(--pink-tint);
    }
    &.adopted {
      color: var(--blue);
      background-color: var(--blue-tint);
    }
    &.executed {
      color: var(--orchid);
      background-color: var(--indigo-tint);
    }
    &.failed {
      color: var(--orange);
      background-color: var(--orange-tint);
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
