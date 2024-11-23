<script lang="ts">
  export let testId: string;
  export let title: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let isCritical: boolean | undefined = undefined;
</script>

<article class="banner" class:isCritical data-tid={testId}>
  <div class="icon">
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
    grid-template-columns: 32px 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      "icon content"
      "actions actions";
    align-items: start;
    grid-gap: var(--padding-1_5x);

    @include media.min-width(medium) {
      grid-template-columns: 32px 1fr auto;
      grid-template-rows: auto;
      grid-template-areas: "icon content actions";
      align-items: center;
    }

    padding: var(--padding-1_5x);
    border-radius: var(--border-radius);
    background: var(--input-background);
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
