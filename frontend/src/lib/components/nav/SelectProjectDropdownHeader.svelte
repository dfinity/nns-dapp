<script lang="ts">
  import SelectProjectDropdown from "$lib/components/nav/SelectProjectDropdown.svelte";
</script>

<div class="dropdown-wrapper">
  <SelectProjectDropdown />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";

  .dropdown-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 0 0 var(--padding-0_5x);

    @include fonts.h4(true);
  }
</style>
