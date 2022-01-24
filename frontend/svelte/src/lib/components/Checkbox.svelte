<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let name: string;
  export let value: string;
  export let checked: boolean;

  const dispatch = createEventDispatcher();
  const select = () => dispatch("select");
</script>

<div class="checkbox" on:click|preventDefault={select}>
  <label for={name}>{value}</label>
  <input
    type="checkbox"
    id={name}
    {name}
    {value}
    {checked}
    on:click|stopPropagation={select}
  />
</div>

<style lang="scss">
  @use "../themes/mixins/select";

  .checkbox {
    @include select.group;

    --select-color: var(--gray-600);
    --select-font-size: inherit;
    --select-background-hover: var(--light-background);

    --select-input-background-color: #fff;
    --select-input-checked-border-color: var(--blue-200);
    --select-input-border-radius: 50%;
  }

  label {
    @include select.label;
  }

  input[type="checkbox"] {
    @include select.input;
  }
</style>
