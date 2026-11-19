<script lang="ts">
  import { nonNullish } from "@dfinity/utils";
  import { createEventDispatcher, type Component } from "svelte";
  import IconCheckCircle from "$lib/gix/icons/IconCheckCircle.svelte";
  import IconExpandMore from "$lib/gix/icons/IconExpandMore.svelte";

  export let role: "button" | "checkbox" | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected = false;
  export let disabled: boolean | undefined = undefined;
  export let testId = "gix-cmp-card";
  export let icon: "expand" | "check" | undefined = undefined;
  export let theme: "transparent" | "framed" | "highlighted" | undefined =
    undefined;
  export let href: string | undefined = undefined;
  export let noPadding = false;
  export let noMargin = false;

  let container: "article" | "a" = "article";
  $: container = nonNullish(href) ? "a" : "article";

  let clickable = false;
  $: clickable = nonNullish(href) || nonNullish(role);

  let showHeadline: boolean;
  $: showHeadline = nonNullish($$slots.start) || nonNullish($$slots.end);

  let ariaChecked: boolean | undefined = undefined;
  $: ariaChecked = role === "checkbox" ? selected : undefined;

  const dispatch = createEventDispatcher();

  const onClick = ($event: MouseEvent | KeyboardEvent) => {
    if (clickable && nonNullish(href)) {
      return;
    }

    dispatch("click", $event?.detail);
  };

  let iconCmp: Component | undefined = undefined;

  $: (() => {
    switch (icon) {
      case "expand":
        iconCmp = IconExpandMore;
        break;
      case "check":
        iconCmp = IconCheckCircle;
        break;
    }
  })();
</script>

<svelte:element
  this={container}
  class={`card ${theme ?? ""}`}
  class:clickable
  class:disabled
  class:icon={nonNullish(icon)}
  class:noMargin
  class:noPadding
  class:selected
  aria-checked={ariaChecked}
  aria-disabled={disabled}
  aria-label={ariaLabel}
  data-tid={testId}
  {href}
  {role}
  on:click={onClick}
>
  {#if nonNullish(iconCmp)}
    <svelte:component this={iconCmp} />
  {/if}

  {#if showHeadline}
    <div class="meta">
      <slot name="start" />
      <slot name="end" />
    </div>
  {/if}

  <slot />
</svelte:element>

<style lang="scss">
  @use "../styles/mixins/interaction";
  @use "../styles/mixins/media";
  @use "../styles/mixins/display";
  @use "../styles/mixins/card";

  article,
  a {
    display: flex;
    flex-direction: column;

    text-decoration: none;

    background: var(--card-background);
    box-shadow: var(--box-shadow);

    transition: color var(--animation-time-normal);

    padding: calc(var(--padding-2x) - var(--card-border-size));
    margin: var(--padding-2x) 0;
    border-radius: var(--border-radius);

    box-sizing: border-box;

    border: var(--card-border-size) solid transparent;

    &.noPadding {
      padding: 0;
    }

    &.noMargin {
      margin: 0;
    }

    &.selected {
      border: 2px solid var(--primary);
    }

    &.disabled {
      background: var(--card-background-disabled);
      color: var(--disable-contrast);

      :global(*) {
        color: inherit;
      }
    }

    &.highlighted {
      background: var(--primary-gradient-fallback);
      background: var(--primary-gradient);
      color: var(--primary-contrast);

      border: 0;

      // TODO: find a better solution (a mixin?)
      :global(h3) {
        color: var(--primary-contrast);
      }
      :global(.value) {
        color: var(--primary-contrast);
      }
      :global(.label) {
        color: var(--primary-contrast);
      }
      :global(.description) {
        color: var(--primary-contrast);
      }
    }

    &.icon {
      position: relative;
      padding-right: var(--padding-6x);

      > :global(svg:first-child) {
        position: absolute;

        height: var(--padding-3x);
        width: auto;

        right: var(--padding-2x);
        top: 50%;
        margin-top: calc(-1 * var(--padding-1_5x));

        color: var(--tertiary);
      }

      &.selected {
        --icon-check-circle-background: var(--primary);
        --icon-check-circle-color: var(--primary-contrast);
      }
    }
  }

  a.card {
    margin: 0;
  }

  .clickable {
    @include interaction.tappable;

    &.disabled {
      @include interaction.disabled;
    }
  }

  .transparent {
    background: transparent;
    box-shadow: none;

    &.selected {
      background: var(--card-background);
    }

    &.clickable {
      &:not([disabled]):hover,
      &:not([disabled]):focus {
        background: var(--card-background-shade);

        &.selected {
          background: var(--focus-background);
        }
      }
    }
  }

  .framed {
    background: var(--background);
    color: var(--background-contrast);
    box-shadow: none;
    border: 2px solid var(--line);

    &.selected {
      background: var(--background);
      border: 2px solid var(--primary);
    }

    &.clickable {
      &:not([disabled]):hover,
      &:not([disabled]):focus {
        background: var(--input-background);

        &.selected {
          background: var(--input-background);
        }

        &:not(.selected) {
          border: 2px solid rgba(var(--disable-contrast-rgb), 0.4);

          &.icon {
            > :global(svg:first-child) {
              color: rgba(var(--disable-contrast-rgb), 0.8);
            }
          }
        }
      }
    }

    &.icon:not(.selected) {
      > :global(svg:first-child) {
        color: var(--line);
      }
    }
  }

  .meta {
    @include card.meta;
  }
</style>
