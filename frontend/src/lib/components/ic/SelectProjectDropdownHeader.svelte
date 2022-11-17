<script lang="ts">
  import SelectProjectDropdown from "$lib/components/neurons/SelectProjectDropdown.svelte";

  export let legacy = false;
</script>

<div class="dropdown-wrapper" class:legacy>
  <SelectProjectDropdown />
</div>

<style lang="scss">
  .dropdown-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0 0 var(--padding-4x);
  }

  .legacy {
    padding: var(--padding-4x) 0 0;
  }
</style>
