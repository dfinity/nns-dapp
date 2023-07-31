<script lang="ts">
  import ExpandableSection from "$lib/components/common/ExpandableSection.svelte";

  export let testId: string;
  export let title: string;
  export let initialDescription: string;
  export let expandedDescription: string;
</script>

<ExpandableSection {testId}>
  <svelte:fragment>{title}</svelte:fragment>
  <span slot="description">{initialDescription}</span>
  <span slot="extended-description">{expandedDescription}</span>
</ExpandableSection>
