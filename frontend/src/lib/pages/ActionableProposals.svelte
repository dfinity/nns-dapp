<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ActionableSnses from "$lib/components/proposals/ActionableSnses.svelte";
  import ActionableNnsProposals from "$lib/components/proposals/ActionableNnsProposals.svelte";
</script>

<TestIdWrapper testId="actionable-proposals-component">
  <!-- TODO: Loading state -->
  <ActionableNnsProposals />
  <ActionableSnses />
  <!-- TODO: No proposals banner -->
</TestIdWrapper>
