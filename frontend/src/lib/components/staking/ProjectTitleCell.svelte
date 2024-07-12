<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import type { TableProject } from "$lib/types/staking";

  export let rowData: TableProject;
</script>

<div data-tid="project-title-cell-component" class="title-logo-wrapper">
  <Logo src={rowData.logo} alt={rowData.title} size="medium" framed />
  <div class="title-wrapper">
    <h5 data-tid="project-title">{rowData.title}</h5>
  </div>
</div>

<style lang="scss">
  h5 {
    margin: 0;
  }

  .title-logo-wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);

    .title-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }
  }
</style>
