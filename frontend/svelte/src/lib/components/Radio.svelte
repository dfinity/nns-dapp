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
</style>
