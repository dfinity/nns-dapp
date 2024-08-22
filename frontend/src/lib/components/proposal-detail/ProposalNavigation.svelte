<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ProposalStatusTag from "$lib/components/ui/ProposalStatusTag.svelte";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import { triggerDebugReport } from "$lib/directives/debug.directives";
  import { i18n } from "$lib/stores/i18n";
  import type {
    ProposalsNavigationId,
    UniversalProposalStatus,
  } from "$lib/types/proposals";
  import type { UniverseCanisterIdText } from "$lib/types/universe";
  import { navigationIdComparator } from "$lib/utils/proposals.utils";
  import { IconLeft, IconRight } from "@dfinity/gix-components";
  import { assertNonNullish, isNullish } from "@dfinity/utils";

  export let currentProposalId: ProposalsNavigationId;
  export let title: string | undefined = undefined;
  export let currentProposalStatus: UniversalProposalStatus;
  // To resolve the absence of the currentProposalId in proposalIds,
  // the proposalIds must be passed in decreasing order by the parent component.
  export let proposalIds: ProposalsNavigationId[] = [];
  // To resolve the absence of the currentProposalId in proposalIds,
  // all the universes must be passed.
  export let universes: UniverseCanisterIdText[] = [];
  export let selectProposal: (id: ProposalsNavigationId) => void;

  let previousId: ProposalsNavigationId | undefined;
  $: previousId = proposalIds.findLast(
    (id) =>
      navigationIdComparator({ a: id, b: currentProposalId, universes }) < 0
  );

  let nextId: ProposalsNavigationId | undefined;
  $: nextId = proposalIds.find(
    (id) =>
      navigationIdComparator({ a: id, b: currentProposalId, universes }) > 0
  );

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
  <button
    class="ghost previous"
    type="button"
    aria-label={$i18n.proposal_detail.previous}
    on:click={selectPrevious}
    class:hidden={isNullish(previousId)}
    data-tid="proposal-nav-previous"
    data-test-proposal-id={previousId?.proposalId.toString() ?? ""}
    ><IconLeft /></button
  >
  <button
    class="ghost next"
    type="button"
    aria-label={$i18n.proposal_detail.next}
    on:click={selectNext}
    class:hidden={isNullish(nextId)}
    data-tid="proposal-nav-next"
    data-test-proposal-id={nextId?.proposalId.toString() ?? ""}
    ><IconRight /></button
  >
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
