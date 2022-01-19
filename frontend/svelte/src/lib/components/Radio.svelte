<script lang="ts">
  export let name: string;
  export let value: string;
  export let checked: boolean;
</script>

<div class="radio">
  <label for={name}>{value}</label>
  <input type="radio" id={name} {name} {value} {checked} />
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
  }

  /** https://moderncss.dev/pure-css-custom-styled-radio-buttons/ **/

  input[type="radio"] {
    appearance: none;
    background-color: #fff;
    margin: 0;

    font: inherit;

    color: currentColor;
    width: 20px;
    height: 20px;

    border: 2px solid currentColor;

    border-radius: 50%;

    transition: background 0.2s, border 0.2s;
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
