<script lang="ts">
  import type { TableProject } from "$lib/types/staking";

  export let rowData: TableProject;
</script>

<div data-tid="project-neurons-cell-component" class="title-logo-wrapper">
  {rowData.neuronCount}
</div>
