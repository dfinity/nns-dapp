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

  export let currentProposalId: bigint;
  export let title: string | undefined = undefined;
  export let currentProposalStatus: UniversalProposalStatus;
  export let proposalIds: bigint[] = [];
  export let selectProposal: (proposalId: bigint) => void;

  let sortedProposalIds: bigint[] = [];
  // sort proposalIds in descent order
  $: sortedProposalIds = [...proposalIds].sort((a, b) => Number(b - a));

  let newerId: bigint | undefined;
  // TODO: switch to findLast() once it's available
  // use `as bigint[]` to avoid TS error (type T | undefined is not assignable to type bigint | undefined)
  $: newerId = ([...sortedProposalIds].reverse() as bigint[]).find(
    (id) => id > currentProposalId
  );

  let olderId: bigint | undefined;
  $: olderId = sortedProposalIds.find((id) => id < currentProposalId);

  const selectNewer = () => {
    assertNonNullish(newerId);
    selectProposal(newerId);
  };
  const selectOlder = () => {
    assertNonNullish(olderId);
    selectProposal(olderId);
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
    class="ghost newer"
    type="button"
    aria-label={$i18n.proposal_detail.newer}
    on:click={selectNewer}
    class:hidden={isNullish(newerId)}
    data-tid="proposal-nav-newer"
  >
    <IconLeft />
    {$i18n.proposal_detail.newer_short}</button
  >
  <button
    class="ghost older"
    type="button"
    aria-label={$i18n.proposal_detail.older}
    on:click={selectOlder}
    class:hidden={isNullish(olderId)}
    data-tid="proposal-nav-older"
  >
    {$i18n.proposal_detail.older_short}
    <IconRight />
  </button>
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
      "status newer older"
      "title title title";

    @include media.min-width(small) {
      row-gap: var(--padding);
      grid-template-areas: "title status newer older";
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
    .newer {
      grid-area: newer;
      @include fonts.small;
    }
    .older {
      grid-area: older;
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
