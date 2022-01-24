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
  @use "../themes/mixins/interaction";
  @use "../themes/mixins/text";

  .radio {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: calc(2 * var(--padding));

    color: var(--gray-200); /* var(--gray-600) */

    @include interaction.tappable;

    font-size: var(--font-size-small); /* different */

    &:hover {
      background: rgba(
        var(--light-background-rgb),
        0.1
      ); /* var(--light-background) */
    }

    border-radius: var(--border-radius); /* different */

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

  input[type="radio"] {
    appearance: none;
    background-color: transparent; /* different #fff */
    margin: 0 var(--checkbox-margin);

    width: var(--checkbox-size);
    height: var(--checkbox-size);

    border: var(--checkbox-border) solid currentColor;

    transition: background 0.2s, border 0.2s;

    cursor: pointer;

    position: relative;
  }

  input[type="radio"]:checked {
    background: var(--blue-600);
    border: 2px solid var(--blue-600); /* different  var(--blue-200) */
  }

  input[type="radio"]:focus {
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
  }

  input[type="radio"]:checked:after {
    left: 4px;
    top: 0px;
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
