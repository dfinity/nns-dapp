<script lang="ts">
  import { afterUpdate, createEventDispatcher } from "svelte";
  import IconExpandMore from "../../icons/IconExpandMore.svelte";
  import { i18n } from "../../stores/i18n";
  import { replacePlaceholders } from "../../utils/i18n.utils";

  export let id: string | undefined = undefined;
  export let initiallyExpanded: boolean = false;
  export let maxContentHeight: number | undefined = undefined;

  export let iconSize: "small" | "medium" = "small";

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
  const maxHeightStyle = (height: number | undefined): string =>
    height === undefined ? "" : `max-height: ${height}px;`;
  // In case of `initiallyExpanded=true` we should avoid calculating `max-height` from the content-height
  // because the content in the slot can be initialized w/ some delay.
  const updateMaxHeight = () => {
    if (userUpdated) {
      maxHeight = expanded ? calculateMaxContentHeight() : 0;
    } else {
      maxHeight = initiallyExpanded ? maxContentHeight : 0;
    }
  };
  // Avoid to show scroll if not necessary
  const overflyYStyle = (height: number | undefined): string =>
    height === undefined || maxContentHeight === undefined
      ? "overflow-y: hidden;"
      : height < maxContentHeight
      ? "overflow-y: hidden;"
      : "overflow-y: auto;";

  // recalculate max-height after DOM update
  afterUpdate(updateMaxHeight);
  let toggleView: string;
  $: toggleView = expanded ? "collpase" : "expand";
</script>

<div
  data-tid="collapsible-header"
  id={id !== undefined ? `heading${id}` : undefined}
  role="term"
  class="header"
  on:click={toggleContent}
>
  <div class="header-content">
    <slot name="header" />
  </div>
  <button
    class="collapsible-expand-icon"
    class:size-medium={iconSize === "medium"}
    class:expanded
    data-tid="collapsible-expand-button"
    aria-expanded={expanded}
    aria-controls={id}
    title={replacePlaceholders($i18n.proposal_detail.summary_toggle_view, {
      $toggleView: toggleView
    })}
  >
    <IconExpandMore />
  </button>
</div>
<div
  data-tid="collapsible-content"
  role="definition"
  class="wrapper"
  class:expanded
  style={`${maxHeightStyle(maxHeight)}${overflyYStyle(maxHeight)}`}
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
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }

  button {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: var(--padding-4x);

    margin: 0;
    padding: 0;

    display: flex;
    align-items: center;

    :global(svg) {
      width: var(--padding-2x);
      transition: transform var(--animation-time-normal);
    }

    &.size-medium {
      :global(svg) {
        width: var(--padding-4x);
      }
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
    }
  }

  .content {
    // to not stick the content to the bottom
    padding-bottom: var(--padding-2x);
    // to respect children margins in contentHeight calculation
    overflow: auto;
    // scrollbar
    padding-right: var(--padding);
  }
</style>
