<script lang="ts">
  export let testId: string | undefined = undefined;

  $: hasNavigation = $$slots.navigation;
</script>

<div class="container" data-tid={testId}>
  <div class="page-header" class:has-navigation={hasNavigation}>
    <slot name="start" />
    <slot name="end" />
  </div>

  <div class="navigation">
    <slot name="navigation" />
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    position: relative;
    display: flex;
    gap: var(--padding);
  }

  .page-header {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    justify-content: center;
    align-items: center;

    @include media.min-width(medium) {
      flex-direction: row;
      justify-content: space-between;
    }
  }
  .has-navigation {
    padding-top: var(--padding-6x);
    @include media.min-width(medium) {
      padding: 0;
    }
  }
  .navigation {
    position: absolute;
    top: 0;
    right: 0;
    @include media.min-width(medium) {
      position: static;
      display: flex;
      align-items: center;
    }
  }
</style>
