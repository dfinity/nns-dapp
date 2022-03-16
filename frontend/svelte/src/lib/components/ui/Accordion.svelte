<script lang="ts">
  import IconExpandMore from "../../icons/IconExpandMore.svelte";

  export let initiallyExpanded: boolean = false;
  export let headerAlign: "left" | "center" = "left";
  export let maxContentHeigh: number | undefined = undefined;

  let expanded: boolean = initiallyExpanded;
  let content: HTMLDivElement | undefined;

  const toggleContent = () => (expanded = !expanded);
  const maxHeight = () => {
    const height = (content && content.offsetHeight) || 0;
    if (maxContentHeigh !== undefined && height > maxContentHeigh) {
      return maxContentHeigh;
    }
    return height;
  };
</script>

<div
  class="header"
  role="button"
  on:click={toggleContent}
  class:alignCenter={headerAlign === "center"}
>
  <div class="header-content">
    <slot name="header" />
  </div>
  <button tabindex="-1" class:expanded>
    <IconExpandMore />
  </button>
</div>
<div
  class="wrapper"
  class:expanded
  style={`max-height: ${expanded ? maxHeight() : 0}px;`}
>
  <div class="content" bind:this={content}>
    <slot />
  </div>
</div>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media";

  .header {
    @include interaction.tappable;
    user-select: none;

    // increase click area
    margin: calc(-1 * var(--padding));
    padding: var(--padding);

    position: relative;

    display: flex;
    justify-content: center;

    .header-content {
      flex: 1;
      margin-right: calc(3 * var(--padding));
    }

    @include media.min-width(medium) {
      .header-content {
        .alignCenter {
          justify-content: center;
          margin-left: calc(3 * var(--padding));
        }
      }
    }
  }

  button {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: calc(4 * var(--padding));

    margin: 0;
    padding: 0;

    display: flex;
    align-items: center;

    :global(svg) {
      width: calc(2.5 * var(--padding));
      transition: transform 0.3s;
    }

    &.expanded {
      :global(svg) {
        transform: rotate(180deg);
      }
    }
  }

  .wrapper {
    margin-top: 0;
    opacity: 0;
    visibility: hidden;

    transition: all 0.3s;

    height: fit-content;
    overflow: hidden;

    &.expanded {
      margin-top: var(--padding);
      opacity: 1;
      visibility: initial;

      overflow-y: auto;
    }
    // TODO: add some border eg border-top: 1px solid rgba(255,255,255, 0.15);
  }

  .content {
    // to respect children margins in height calculation
    overflow: auto;
  }
</style>
