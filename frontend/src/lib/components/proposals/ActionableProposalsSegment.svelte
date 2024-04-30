<script lang="ts">
  import { Segment, SegmentButton } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { isNullish } from "@dfinity/utils";

  const actionableProposalsSegmentId = Symbol();
  const allProposalsSegmentId = Symbol();

  let selectedSegmentId: symbol = isNullish(
    $actionableProposalsSegmentStore.selected
  )
    ? // If the store is not initialized (by user selection), we need to determine the initial value,
      // which is "Actionables" for signed-in users and "All" for others.
      $authSignedInStore
      ? actionableProposalsSegmentId
      : allProposalsSegmentId
    : $actionableProposalsSegmentStore.selected !== "all"
    ? actionableProposalsSegmentId
    : allProposalsSegmentId;

  $: selectedSegmentId,
    (() =>
      actionableProposalsSegmentStore.set(
        selectedSegmentId === actionableProposalsSegmentId
          ? "actionable"
          : "all"
      ))();
</script>

<div data-tid="actionable-proposals-segment-component">
  <Segment bind:selectedSegmentId>
    <SegmentButton testId="all-proposals" segmentId={allProposalsSegmentId}
      >{$i18n.voting.all_proposals}</SegmentButton
    >
    <SegmentButton
      testId="actionable-proposals"
      segmentId={actionableProposalsSegmentId}
      >{$i18n.voting.actionable_proposals}</SegmentButton
    >
  </Segment>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  div {
    display: contents;

    --segment-width: 100%;
    @include media.min-width(medium) {
      --segment-width: fit-content;
      --segment-button-width: calc(var(--padding) * 23);
    }
  }
</style>
