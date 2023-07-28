<script lang="ts">
  import { IconInfo, Section } from "@dfinity/gix-components";
  import { afterUpdate } from "svelte";

  export let testId: string;

  let showExpanded = false;
  let toggleContent: () => void = () => {
    showExpanded = !showExpanded;
  };

  let contentHeight: number | undefined;
  let initialTextContainer: HTMLSpanElement | undefined;
  let extendedTextContainer: HTMLSpanElement | undefined;

  const initialTextheight = (): number =>
    initialTextContainer?.getBoundingClientRect().height ??
    initialTextContainer?.offsetHeight ??
    0;
  const extendedTextheight = (): number =>
    extendedTextContainer?.getBoundingClientRect().height ??
    extendedTextContainer?.offsetHeight ??
    0;
  const updateMaxHeight = () => {
    contentHeight =
      initialTextheight() + (showExpanded ? extendedTextheight() : 0);
  };
  const maxHeightStyle = (height: number | undefined): string =>
    `max-height: ${height}px;`;
  // recalculate max-height after DOM update
  afterUpdate(updateMaxHeight);
</script>

<Section {testId}>
  <h3 slot="title" on:click={toggleContent} on:keypress={toggleContent}>
    <span><slot name="title" /></span>
    <button class="icon" on:click|stopPropagation={toggleContent}
      ><IconInfo /></button
    >
  </h3>
  <slot slot="end" name="end" />
  <p
    slot="description"
    class="description-text"
    class:expanded={showExpanded}
    style={maxHeightStyle(contentHeight)}
  >
    <span bind:this={initialTextContainer}>
      <slot name="description" />
    </span>
    <span
      class="expanded-text"
      class:expanded={showExpanded}
      bind:this={extendedTextContainer}
    >
      <slot name="extended-description" />
    </span>
  </p>
  <slot />
</Section>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";

  h3,
  p {
    margin: 0;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: var(--padding);

    @include interaction.tappable;
  }

  .description-text {
    transition: all var(--animation-time-normal);

    .expanded-text {
      transition: all var(--animation-time-normal);
      visibility: hidden;
      opacity: 0;
      overflow: hidden;

      &.expanded {
        transition: all var(--animation-time-normal);
        visibility: initial;
        opacity: 1;
      }
    }
  }
</style>
