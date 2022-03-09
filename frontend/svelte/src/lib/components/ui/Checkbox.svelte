<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let inputId: string;
  export let checked: boolean;

  export let theme: "dark" | "light" = "light";
  export let text: "block" | "inline" = "inline";

  export let selector: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  /**
   * Emit an event when the checkbox or container is clicked. The state should be updated by consumer.
   */
  const onClick = () => dispatch("nnsChange");
</script>

<div
  on:click|preventDefault={onClick}
  class={`checkbox ${theme} ${selector ?? ""}`}
>
  <label for={inputId} class={text}><slot /></label>
  <input
    type="checkbox"
    id={inputId}
    {checked}
    on:click|stopPropagation={onClick}
  />
</div>

<style lang="scss">
  @use "../../themes/mixins/select";
  @use "../../themes/mixins/text";

  .checkbox {
    @include select.group;

    &.light {
      --select-color: var(--gray-600);
      --select-background-hover: var(--light-background);
    }

    &.dark {
      --select-color: var(--gray-200);
      --select-background-hover: rgba(var(--light-background-rgb), 0.1);
      --select-border-radius: var(--border-radius);
    }
  }

  label {
    @include select.label;

    &.inline {
      @include text.truncate;
    }
  }

  input[type="checkbox"] {
    @include select.input;
  }
</style>
