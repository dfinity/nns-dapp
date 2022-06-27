<script lang="ts">
  export let role: "link" | "button" | "checkbox" | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;
  export let selected: boolean = false;
  export let disabled: boolean | undefined = undefined;
  export let testId: string = "card";

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
  class:selected
  class:disabled
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

    padding: var(--padding-2x);
    margin: var(--padding-2x) 0;
    border-radius: var(--border-radius);

    box-shadow: var(--card-box-shadow);

    outline: 2px solid transparent;
    &.selected {
      outline: 2px solid var(--primary);
    }

    &.disabled {
      background: var(--background-shade);
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
