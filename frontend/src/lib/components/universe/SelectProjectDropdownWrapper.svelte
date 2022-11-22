<script lang="ts">
  import SelectProjectDropdown from "$lib/components/universe/SelectProjectDropdown.svelte";
</script>

<div class="dropdown-wrapper">
  <SelectProjectDropdown />
</div>

<style lang="scss">
  @use "../../../../node_modules/@dfinity/gix-components/styles/mixins/fonts";
  @use "../../../../node_modules/@dfinity/gix-components/styles/mixins/media";

  .dropdown-wrapper {
    padding: 0 0 var(--padding-0_5x);

    @include fonts.h4(true);

    @include media.min-width(small) {
      display: flex;
      justify-content: center;
      align-items: center;

      --logo-display: none;
      --select-offset-start: var(--padding-2x);
    }
  }
</style>
