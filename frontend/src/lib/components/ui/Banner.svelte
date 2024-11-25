<script lang="ts">
  export let testId: string = "banner-component";
  export let title: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let isCritical: boolean | undefined = undefined;
</script>

<article data-tid={testId} class="banner" class:isCritical>
  <div class="icon" aria-hidden="true">
    <slot name="icon"></slot>
  </div>
  <div class="content-wrapper">
    {#if title}
      <h2 class="title">{title}</h2>
    {/if}
    {#if text}
      <p class="text">{text}</p>
    {/if}
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
  <div class="actions">
    <slot name="actions"></slot>
  </div>
</article>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .banner {
    display: grid;
    grid-template-areas:
      "icon"
      "content"
      "actions";
    grid-gap: var(--padding-1_5x);

    @include media.min-width(small) {
      grid-template-areas:
        "icon content"
        "actions actions";
      grid-template-columns: auto 1fr;
    }

    @include media.min-width(medium) {
      grid-template-areas: "icon content actions";
      grid-template-columns: auto 1fr auto;
      align-items: center;
    }

    padding: var(--padding-1_5x);
    border-radius: var(--border-radius);
    background: var(--input-background);
  }

  .banner.isCritical {
    background: var(--tooltip-background);

    .title {
      color: var(--tooltip-text-color);
    }
    .text {
      color: var(--tooltip-description-color);
    }
  }

  .icon {
    grid-area: icon;
  }
  .content-wrapper {
    grid-area: content;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    overflow: hidden;
  }
  .actions {
    grid-area: actions;
    display: flex;
    gap: var(--padding-1_5x);
  }

  .title {
    margin: 0;
    @include fonts.standard(true);
  }
  .text {
    margin: 0;
    @include fonts.standard(false);
    color: var(--description-color);
  }
</style>
