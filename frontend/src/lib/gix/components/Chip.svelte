<script lang="ts">
  interface Props {
    label: string;
    id: string;
    selected: boolean;
    onClick: (id: string) => void;
  }

  let { label, id, selected, onClick }: Props = $props();
</script>

<button
  class="chip"
  class:selected
  aria-checked={selected}
  data-tid="chip-component"
  onclick={() => onClick(id)}
  role="radio"
  type="button">{label}</button
>

<style lang="scss">
  @use "../styles/mixins/effect";
  @use "../styles/mixins/fonts";
  @use "../styles/mixins/button";

  .chip {
    @include button.base(false);
    @include fonts.small(true);

    // Override default button styles
    padding: var(--padding) var(--padding-1_5x);
    min-height: 0;
    border: solid var(--button-border-size) var(--primary);
    background: transparent;
    color: var(--button-secondary-color);
    border-radius: var(--border-radius-5x);

    transition: all var(--animation-time-short) ease-in;

    &:hover,
    &:focus {
      background: var(--button-card-focus-background);
    }

    &.selected {
      background: var(--primary);
      color: var(--primary-contrast);
      pointer-events: none;

      &:hover,
      &:focus {
        background: var(--primary);
      }
    }
  }
</style>
