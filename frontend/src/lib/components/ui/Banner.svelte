<script lang="ts">
  import { Html, IconClose } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let testId: string = "banner-component";

  /** Dispatches `nnsClose` event */
  export let isClosable: boolean = false;
  /** Displayed in a high-contrast */
  export let isCritical: boolean = false;

  export let title: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let htmlText: string | undefined = undefined;

  const dispatcher = createEventDispatcher();
</script>

<article data-tid={testId} class="banner" class:isCritical>
  <div class="icon" aria-hidden="true">
    <slot name="icon"></slot>
  </div>
  {#if isClosable}
    <div class="close">
      <button
        class="icon-only"
        on:click={() => dispatcher("nnsClose")}
        aria-label="Close"
        data-tid="close-button"
      >
        <IconClose />
      </button>
    </div>
  {/if}
  <div class="content-wrapper">
    {#if title}
      <h2 class="title" data-tid="title">{title}</h2>
    {/if}
    {#if text}
      <p class="text" data-tid="text">{text}</p>
    {/if}
    {#if htmlText}
      <TestIdWrapper testId="html-text">
        <Html text={htmlText} />
      </TestIdWrapper>
    {/if}
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
      "icon close"
      ". ."
      "content content"
      ". ."
      "actions actions";
    grid-template-columns: 1fr auto;
    grid-template-rows: auto var(--padding-1_5x) auto var(--padding-3x) auto;
    @include media.min-width(medium) {
      grid-template-areas: "icon content actions close";
      grid-template-columns: auto 1fr auto auto;
      grid-template-rows: auto;
      grid-gap: var(--padding-1_5x);
      align-items: center;
    }

    padding: var(--padding-2x);
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
    .close {
      color: var(--tooltip-description-color);
    }
  }

  .icon {
    grid-area: icon;
  }
  .close {
    grid-area: close;
  }
  .content-wrapper {
    grid-area: content;

    display: flex;
    flex-direction: column;
    gap: var(--padding);
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
