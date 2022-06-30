<script lang="ts">
  import IconArrowRight from "../../icons/IconArrowRight.svelte";

  export let role: "link" | "button" | "checkbox" | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected: boolean = false;
  export let disabled: boolean | undefined = undefined;
  export let testId: string = "card";
  export let style: "default" | "blue" = "default";
  export let withArrow: boolean | undefined = undefined;

  let clickable: boolean = false;

  $: clickable =
    role !== undefined ? ["button", "link", "checkbox"].includes(role) : false;

  let showHeadline: boolean;
  $: showHeadline = $$slots.start !== undefined || $$slots.end !== undefined;

  let ariaChecked: boolean | undefined = undefined;
  $: ariaChecked = role === "checkbox" ? selected : undefined;
</script>

<article
  data-tid={testId}
  {role}
  on:click
  class:clickable
  class:withArrow
  class:selected
  class:disabled
  class:blue={style === "blue"}
  aria-disabled={disabled}
  aria-checked={ariaChecked}
  aria-label={ariaLabel}
>
  {#if withArrow === true}
    <IconArrowRight />
  {/if}

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
  @use "../../themes/mixins/media";
  @use "../../themes/mixins/display";

  article {
    text-decoration: none;

    background: var(--card-background);
    color: var(--card-background-contrast);
    box-shadow: var(--box-shadow);

    transition: color var(--animation-time-normal);

    padding: var(--padding-2x);
    margin: var(--padding-2x) 0;
    border-radius: var(--border-radius);

    outline: 2px solid transparent;
    &.selected {
      outline: 2px solid var(--primary);
    }

    &.disabled {
      background: var(--background-shade);
    }

    &.blue {
      background: var(--primary-gradient-fallback);
      background: var(--primary-gradient);
      color: var(--primary-gradient-contrast);
    }

    &.withArrow {
      position: relative;
      padding-right: var(--padding-6x);

      :global(svg:first-child) {
        position: absolute;

        height: var(--padding-3x);
        width: auto;

        right: var(--padding-2x);
        top: 50%;
        margin-top: calc(-1 * var(--padding-1_5x));

        opacity: var(--light-opacity);
      }
    }
  }

  .clickable {
    @include interaction.tappable;

    &.disabled {
      @include interaction.disabled;
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
