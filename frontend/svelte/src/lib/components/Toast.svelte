<script>
  import IconClose from "../icons/IconClose.svelte";
</script>

<div role="dialog" class="toast error">
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vel turpis tempor, bibendum nunc vel, condimentum ligula.</p>

  <button><IconClose /></button>
</div>

<style lang="scss">
  @use "../themes/mixins/text";

  .toast {
    display: flex;
    justify-content: space-between;
    align-items: center;

    position: fixed;
    bottom: calc(2 * var(--padding));
    left: 50%;
    transform: translate(-50%, 0);

    border-radius: var(--border-radius);
    background: var(--black);
    color: var(--black-contrast);
    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);

    width: calc(100% - (8 * var(--padding)));

    padding: var(--padding) calc(var(--padding) * 2);
    box-sizing: border-box;

    @media (min-width: 880px) {
      max-width: var(--section-max-width);
    }

    &.error {
      background: var(--pink);
      color: var(--pink-contrast);
    }
  }

  p {
    @include text.clamp(2);

    margin: 0;
    font-size: 1rem;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
