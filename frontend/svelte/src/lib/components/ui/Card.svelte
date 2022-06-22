<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let role: "link" | "button" | "checkbox" | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected: boolean = false;
  export let disabled: boolean | undefined = undefined;
  export let testId: string = "card";

  const dispatch = createEventDispatcher();

  $: clickable =
    role !== undefined ? ["button", "link", "checkbox"].includes(role) : false;

  let showHeadline: boolean;
  $: showHeadline = $$slots.start !== undefined || $$slots.end !== undefined;

  let ariaChecked: boolean | undefined = undefined;
  $: ariaChecked = role === "checkbox" ? selected : undefined;

  // Simulate click event on pressing "space" key (https://www.w3.org/WAI/GL/wiki/Making_actions_keyboard_accessible_by_using_keyboard_event_handlers_with_WAI-ARIA_controls)
  const keydown = (event: KeyboardEvent) => {
    if (
      event.key === " " &&
      (event.target as HTMLElement).tagName === "ARTICLE"
    ) {
      dispatch("click");
      event.stopPropagation();
    }
  };
</script>

<article
  data-tid={testId}
  {role}
  on:click
  on:keydown={keydown}
  class:clickable
  class:selected
  class:disabled
  tabindex={role === undefined ? undefined : 0}
  aria-disabled={disabled}
  aria-checked={ariaChecked}
  aria-label={ariaLabel}
>
  {#if showHeadline}
    <div>
      <slot name="start" />
      <slot name="end" />
    </div>
  {/if}

  <slot />
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media.scss";
  @use "../../themes/mixins/display";

  article {
    text-decoration: none;

    background: var(--background);
    color: var(--gray-50);

    padding: var(--padding-2_5x);
    margin: var(--padding-2x) 0;
    border-radius: var(--border-radius);

    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);

    border: 2px solid transparent;
    &.selected {
      border: 2px solid var(--blue-500);
    }

    &.disabled {
      background: var(--background-hover);
    }
  }

  .clickable {
    @include interaction.tappable;

    &.disabled {
      @include interaction.disabled;
    }

    &:focus,
    &:hover {
      background: var(--background-hover);
    }
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    @include media.min-width(small) {
      @include display.space-between;
      flex-direction: row;

      margin: 0 0 var(--padding);
    }
  }
</style>
