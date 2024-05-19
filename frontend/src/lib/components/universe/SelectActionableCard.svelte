<script lang="ts">
  import { Card, IconVote } from "@dfinity/gix-components";
  import {
    actionableProposalIndicationEnabledStore,
    actionableProposalTotalCountStore,
  } from "$lib/derived/actionable-proposals.derived";
  import { i18n } from "$lib/stores/i18n";
  import ActionableProposalTotalCountBadge from "$lib/components/proposals/ActionableProposalTotalCountBadge.svelte";
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  export let selected: boolean;

  let totalCount = 0;
  $: totalCount = $actionableProposalTotalCountStore ?? 0;

  // Always rerender to trigger animation start
  let mounted = false;
  onMount(() => {
    console.log("SelectActionableCard component mounted", totalCount, mounted);
    mounted = true;
  });
</script>

<Card
  role="button"
  {selected}
  theme="transparent"
  on:click
  testId="select-actionable-card-component"
  noPadding
  noMargin
>
  <div class="container" class:selected>
    <div class="icon">
      <IconVote size="24px" />
    </div>

    <div class="content">
      <span class="name">
        {$i18n.voting.actionable_proposals}
        {#if $actionableProposalIndicationEnabledStore}
          {#if totalCount > 0 && mounted}
            <div
              in:scale={{
                duration: 250,
                easing: cubicOut,
              }}
            >
              <ActionableProposalTotalCountBadge />
            </div>
          {/if}
        {/if}
      </span>
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .icon {
    // Same as UniverseLogo size
    width: var(--padding-6x);
    height: var(--padding-6x);

    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--primary);
  }

  .container {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);
    // Same as Card padding
    // We want to padding in the container to use the hover effect on ALL the card surface.
    padding: calc(var(--padding-2x) - var(--card-border-size));

    --value-color: var(--text-color);

    &:not(.selected) {
      --logo-framed-background: transparent;
    }

    &:hover,
    &:focus,
    &.selected {
      --logo-framed-background: var(--primary);
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .name {
    @include fonts.standard(true);
    @include text.clamp(2);

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--padding);
  }
</style>
