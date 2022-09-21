<script lang="ts">
  import SelectProjectDropdown from "../neurons/SelectProjectDropdown.svelte";
</script>

<div class="dropdown-wrapper">
  <SelectProjectDropdown />
</div>

<style lang="scss">
  .dropdown-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    margin-top: var(--padding-4x);
  }
</style>
