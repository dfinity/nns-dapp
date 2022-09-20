<script lang="ts">
  import SelectProjectDropdown from "../neurons/SelectProjectDropdown.svelte";
</script>

<div class="dropdown-wrapper">
  <!-- Extra div is needed to fit to the content size instead of the whole width -->
  <div>
    <SelectProjectDropdown />
  </div>
</div>

<style lang="scss">
  .dropdown-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    margin-top: var(--padding-4x);
  }
</style>
