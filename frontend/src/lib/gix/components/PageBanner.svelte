<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<!-- Safari doesn't handle well grid inside flexbox -->
<!-- https://stackoverflow.com/questions/62075401/safari-grid-in-flexbox-produces-height-overflow -->
<!-- Wrapping this avoids clients of gix-components having the problem -->
<div>
  <div class="container" data-tid={testId}>
    <div class="image-wrapper">
      <slot name="image" />
    </div>
    <div class="content-wrapper">
      <div class="banner-content">
        <h1><slot name="title" /></h1>
        <slot name="description" />
      </div>
      <div class="banner-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  @use "../styles/mixins/media";

  h1 {
    margin: 0;
    line-height: var(--line-height-standard);
  }

  .container {
    padding: var(--padding-3x) var(--padding-2x);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--padding-2x);

    background: var(--card-background);
    border-radius: var(--border-radius);

    @include media.min-width(medium) {
      display: grid;
      grid-template-columns: var(--page-banner-image-width-desktop) auto;
      gap: var(--padding-3x);

      padding: var(--padding-4x);
    }
  }

  .image-wrapper {
    height: 100%;
    width: var(--page-banner-image-width-mobile);
    display: flex;
    align-items: center;
    justify-content: center;

    @include media.min-width(medium) {
      width: 100%;
    }
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--padding-2x);

    @include media.min-width(medium) {
      align-items: flex-start;
    }
  }

  .banner-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--padding);

    text-align: center;

    @include media.min-width(medium) {
      text-align: left;

      align-items: flex-start;
    }
  }

  .banner-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--padding);
  }
</style>
