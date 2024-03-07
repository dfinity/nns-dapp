<script lang="ts">
  import { Segment, SegmentButton } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let selectedSegment: "all" | "actionable";
  export let defaultSegment: "all" | "actionable";

  const actionableProposalsSegmentId = Symbol();
  const allProposalsSegmentId = Symbol();

  let segment: Segment;
  let selectedSegmentId: symbol =
    defaultSegment === "all"
      ? allProposalsSegmentId
      : actionableProposalsSegmentId;

  $: selectedSegment =
    selectedSegmentId === actionableProposalsSegmentId ? "actionable" : "all";
</script>

<TestIdWrapper testId="actionable-proposals-switcher-component">
  <Segment bind:selectedSegmentId bind:this={segment}>
    <SegmentButton testId="all-proposals" segmentId={allProposalsSegmentId}
      >{$i18n.voting.all_proposals}</SegmentButton
    >
    <SegmentButton
      testId="actionable-proposals"
      segmentId={actionableProposalsSegmentId}
      >{$i18n.voting.actionable_proposals}</SegmentButton
    >
  </Segment>
</TestIdWrapper>
