<script lang="ts">
  import { Segment, SegmentButton } from "@dfinity/gix-components";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let selectedSegment: "all" | "actionable";

  const actionableProposalsSegmentId = Symbol();
  const allProposalsSegmentId = Symbol();

  let segment: Segment;
  // TODO(max): get default from parent
  let selectedSegmentId: symbol = allProposalsSegmentId;

  $: selectedSegment =
    selectedSegmentId === actionableProposalsSegmentId ? "actionable" : "all";
</script>

<TestIdWrapper testId="actionable-proposals-segment-component">
  <Segment bind:selectedSegmentId bind:this={segment}>
    <!--    TODO(max): move to i18n-->
    <SegmentButton testId="all-proposals" segmentId={allProposalsSegmentId}
      >All Proposals</SegmentButton
    >
    <SegmentButton
      testId="actionable-proposals"
      segmentId={actionableProposalsSegmentId}
      >Actionable Proposals</SegmentButton
    >
  </Segment>
</TestIdWrapper>
