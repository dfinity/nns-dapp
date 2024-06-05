<script lang="ts">
  import { IconLeft, IconRight } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { assertNonNullish, isNullish } from "@dfinity/utils";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import ProposalStatusTag from "$lib/components/ui/ProposalStatusTag.svelte";
  import { triggerDebugReport } from "$lib/directives/debug.directives";
  import { pageStore } from "$lib/derived/page.derived";

  export let currentProposalId: bigint;
  export let title: string | undefined = undefined;
  export let currentProposalStatus: UniversalProposalStatus;
  export let proposalIds: bigint[] = [];
  export let selectProposal: (proposalId: bigint) => void;

  let previousId: bigint | undefined;
  // TODO: switch to findLast() once it's available
  // use `as bigint[]` to avoid TS error (type T | undefined is not assignable to type bigint | undefined)
  $: previousId = ([...proposalIds].reverse() as bigint[]).find(
    (id) => id > currentProposalId
  );

  let nextId: bigint | undefined;
  $: nextId = proposalIds.find((id) => id < currentProposalId);

  const selectPrevious = () => {
    assertNonNullish(previousId);
    selectProposal(previousId);
  };
  const selectNext = () => {
    assertNonNullish(nextId);
    selectProposal(nextId);
  };
</script>

<div class="proposal-nav" role="toolbar" data-tid="proposal-nav">
  <div class="status">
    <ProposalStatusTag status={currentProposalStatus} />
  </div>
  <h2 class="title" use:triggerDebugReport>
    <span class="universe-logo">
      <UniverseLogo
        size="medium"
        framed
        horizontalPadding={false}
        universe={$selectedUniverseStore}
      />
    </span>
    <TestIdWrapper testId="title">{title ?? ""}</TestIdWrapper>
  </h2>
  {#if !$pageStore.actionable}
    <button
      class="ghost previous"
      type="button"
      aria-label={$i18n.proposal_detail.previous}
      on:click={selectPrevious}
      class:hidden={isNullish(previousId)}
      data-tid="proposal-nav-previous"
      data-test-proposal-id={previousId?.toString() ?? ""}
    >
      <IconLeft />
      {$i18n.proposal_detail.previous_short}</button
    >
    <button
      class="ghost next"
      type="button"
      aria-label={$i18n.proposal_detail.next}
      on:click={selectNext}
      class:hidden={isNullish(nextId)}
      data-tid="proposal-nav-next"
      data-test-proposal-id={nextId?.toString() ?? ""}
    >
      {$i18n.proposal_detail.next_short}
      <IconRight />
    </button>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  div.proposal-nav {
    margin-bottom: var(--padding-2x);
    display: grid;
    column-gap: var(--padding-1_5x);
    row-gap: var(--padding-2x);
    align-items: center;
    grid-template-columns: 1fr auto auto;
    grid-template-areas:
      "status previous next"
      "title title title";

    @include media.min-width(small) {
      row-gap: var(--padding);
      grid-template-areas: "title status previous next";
      grid-template-columns: auto 1fr auto auto;
    }

    .status {
      grid-area: status;
      flex: 1 1 auto;
    }
    .title {
      @include fonts.h3;
      margin: 0;
      grid-area: title;
      display: flex;
      align-items: center;
      gap: var(--padding);
    }
    .previous {
      grid-area: previous;
      @include fonts.small;
    }
    .next {
      grid-area: next;
      @include fonts.small;
    }
  }

  button {
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    &.hidden {
      visibility: hidden;
      opacity: 0;
    }
  }
</style>
