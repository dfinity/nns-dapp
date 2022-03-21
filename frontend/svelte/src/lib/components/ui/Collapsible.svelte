<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
  import IconExpandMore from "../../icons/IconExpandMore.svelte";

  export let id: string | undefined = undefined;
  export let initiallyExpanded: boolean = false;
  export let headerAlign: "left" | "center" = "left";
  export let maxContentHeight: number | undefined = undefined;

  // Minimum height when some part of the text-content is visible (empirical value)
  const CONTENT_MIN_HEIGHT = 40;
  const dispatch = createEventDispatcher();

  let expanded: boolean = initiallyExpanded;
  let offsetHeight: number | undefined;
  let userUpdated: boolean = false;
  let maxHeight: number | undefined;

  const dispatchUpdate = () => dispatch("nnsToggle", { expanded });
  const toggleContent = () => {
    userUpdated = true;
    expanded = !expanded;
    dispatchUpdate();
  };
  const calculateMaxContentHeight = (): number => {
    if (maxContentHeight !== undefined) return maxContentHeight;
    const height = offsetHeight === undefined ? 0 : offsetHeight;
    return height < CONTENT_MIN_HEIGHT ? CONTENT_MIN_HEIGHT : height;
  };
  const maxHeightStyle = (value: number | undefined): string =>
    value === undefined ? "" : `max-height: ${value}px;`;
  // In case of `initiallyExpanded=true` we should avoid calculating `max-height` from the content-height
  // because the content in the slot can be initialized w/ some delay.
  const updateMaxHeight = () => {
    if (userUpdated) {
      maxHeight = expanded ? calculateMaxContentHeight() : 0;
    } else {
      maxHeight = initiallyExpanded ? maxContentHeight : 0;
    }
  };

  // recalculate max-height after DOM update
  afterUpdate(updateMaxHeight);
</script>

<div
  data-tid="collapsible-header"
  id={id !== undefined ? `heading${id}` : undefined}
  role="term"
  class="header"
  on:click={toggleContent}
  class:alignCenter={headerAlign === "center"}
>
  <div class="header-content">
    <slot name="header" />
  </div>
  <button class:expanded aria-expanded={expanded} aria-controls={id}>
    <IconExpandMore />
  </button>
</div>
<div
  data-tid="collapsible-content"
  role="definition"
  class="wrapper"
  class:expanded
  style={maxHeightStyle(maxHeight)}
>
  <div
    {id}
    aria-labelledby={id !== undefined ? `heading${id}` : undefined}
    class="content"
    bind:offsetHeight
  >
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
      &.alignCenter {
        justify-content: center;

        .header-content {
          display: flex;
          align-items: center;
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
      fill: var(--background-contrast);

      transition: transform var(--animation-time-normal);
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

    transition: all var(--animation-time-normal);

    height: fit-content;
    overflow: hidden;

    &.expanded {
      margin-top: var(--padding);
      opacity: 1;
      visibility: initial;

      overflow-y: auto;
    }
  }

  .content {
    // to not stick the content to the bottom
    margin-bottom: calc(2 * var(--padding));
    // to respect children margins in contentHeight calculation
    overflow: auto;
    // scrollbar
    padding-right: var(--padding);
  }
</style>
