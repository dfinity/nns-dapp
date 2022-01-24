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
  @use "../themes/mixins/interaction";
  @use "../themes/mixins/text";

  .checkbox {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: calc(2 * var(--padding));

    color: var(--gray-600);

    @include interaction.tappable;

    &:hover {
      background: var(--light-background);
    }

    --checkbox-size: 20px;
    --checkbox-border: 2px;
    --checkbox-margin: calc(var(--padding) / 2);
  }

  label {
    @include text.truncate;

    user-select: none;
    cursor: pointer;

    width: calc(
      100% - var(--checkbox-size) - (2 * var(--checkbox-border)) -
        (2 * var(--checkbox-margin))
    );
  }

  /** https://moderncss.dev/pure-css-custom-styled-radio-buttons/ **/

  input[type="checkbox"] {
    appearance: none;
    background-color: #fff;
    margin: 0 var(--checkbox-margin);

    width: var(--checkbox-size);
    height: var(--checkbox-size);

    border: var(--checkbox-border) solid currentColor;

    border-radius: 50%;

    transition: background 0.2s, border 0.2s;

    cursor: pointer;
  }

  input[type="checkbox"]:checked {
    background: var(--blue-600);
    border: 2px solid var(--blue-200);
  }

  input[type="checkbox"]:focus {
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
  }
</style>
