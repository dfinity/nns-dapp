<script lang="ts">
  import {createEventDispatcher} from 'svelte';

  export let name: string;
  export let value: string;
  export let checked: boolean;

  const dispatch = createEventDispatcher();
  const select = () => dispatch("select");
</script>

<div class="radio" on:click|preventDefault={select}>
  <label for={name}>{value}</label>
  <input type="radio" id={name} {name} {value} {checked} on:click|stopPropagation={select}/>
</div>

<style lang="scss">
  @use "../themes/mixins/interaction";
  @use "../themes/mixins/text";

  .radio {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: calc(2 * var(--padding));

    color: var(--gray-600);

    @include interaction.tappable;

    &:hover {
      background: var(--light-background);
    }
  }

  label {
    @include text.truncate;

    user-select: none;
    cursor: pointer;
  }

  /** https://moderncss.dev/pure-css-custom-styled-radio-buttons/ **/

  input[type="radio"] {
    appearance: none;
    background-color: #fff;
    margin: 0 calc(var(--padding) / 2);

    font: inherit;

    color: currentColor;
    width: 20px;
    height: 20px;

    border: 2px solid currentColor;

    border-radius: 50%;

    transition: background 0.2s, border 0.2s;

    cursor: pointer;
  }

  input[type=radio]:checked {
    background: var(--blue-600);
    border: 2px solid var(--blue-200);
  }

  input[type=radio]:focus {
    outline: 2px solid var(--blue-600);
    outline-offset: 2px;
  }
</style>
