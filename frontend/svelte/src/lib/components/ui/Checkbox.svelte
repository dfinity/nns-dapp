<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let inputId: string;
  export let checked: boolean;
  export let preventDefault: boolean = false;

  export let text: "block" | "inline" = "inline";

  export let selector: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  /**
   * Emit an event when the checkbox or container is clicked. The state should be updated by consumer.
   */
  const onClick = (event) => {
    if (preventDefault) {
      event.preventDefault();
    }
    dispatch("nnsChange");
  };
</script>

<div on:click|preventDefault={onClick} class={`checkbox ${selector ?? ""}`}>
  <label for={inputId} class={text}><slot /></label>
  <input
    data-tid="checkbox"
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

    --select-background-hover: var(--background-shade);
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
