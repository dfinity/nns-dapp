<script lang="ts">
  import ApyDisplay from "$lib/components/ic/ApyDisplay.svelte";
  import type { TableProject } from "$lib/types/staking";

  export let rowData: TableProject;
</script>

<div data-tid="project-apy-cell-component">
  <ApyDisplay apy={rowData.apy} isLoading={false} forPortfolio={false} />
</div>
