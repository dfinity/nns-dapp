<script lang="ts">
  import SelectProjectDropdown from "$lib/components/neurons/SelectProjectDropdown.svelte";
</script>

<div class="dropdown-wrapper">
  <SelectProjectDropdown />
</div>

<style lang="scss">
  .dropdown-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0 0 var(--padding-4x);
  }
</style>
