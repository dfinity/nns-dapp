<script lang="ts">
  import Segment from "$lib/gix/components/Segment.svelte";
  import SegmentButton from "$lib/gix/components/SegmentButton.svelte";

  export let firstSegmentId;
  export let secondSegmentId;
  export let thirdSegmentId;
  let selectedSegmentId = firstSegmentId;
</script>

<Segment bind:selectedSegmentId>
  <SegmentButton segmentId={firstSegmentId}>Default</SegmentButton>
  <SegmentButton segmentId={secondSegmentId}>Segment</SegmentButton>
  <SegmentButton segmentId={thirdSegmentId}>Other</SegmentButton>
</Segment>
