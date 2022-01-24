<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let name: string;
  export let value: string;
  export let checked: boolean;

  const dispatch = createEventDispatcher();
  const select = () => dispatch("select");
</script>

<div class="radio" on:click|preventDefault={select}>
  <label for={name}>{value}</label>
  <input
    type="radio"
    id={name}
    {name}
    {value}
    {checked}
    on:click|stopPropagation={select}
  />
</div>

<style lang="scss">
  @use "../themes/mixins/select";

  .radio {
    @include select.group;

    --select-color: var(--gray-200);
    --select-font-size: var(--font-size-small);
    --select-background-hover: rgba(var(--light-background-rgb), 0.1);
    --select-border-radius: var(--border-radius);

    --select-input-background-color: transparent;
    --select-input-checked-border-color: var(--blue-600);
  }

  label {
    @include select.label;
  }

  input[type="radio"] {
    @include select.input;
  }

  input[type="radio"]:checked:after {
    left: 4px;
    top: 0;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    display: block;
    content: "";
    position: absolute;
  }
</style>
