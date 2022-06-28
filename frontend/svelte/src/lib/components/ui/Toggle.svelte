<script lang="ts">
  // adapted from https://www.florin-pop.com/blog/2019/05/dark-light-theme-toggle/

  import { createEventDispatcher } from "svelte";

  export let checked: boolean;
  export let ariaLabel: string;

  const dispatch = createEventDispatcher();
</script>

<div class="toggle">
  <input
    type="checkbox"
    id="toggle"
    on:input={({ currentTarget }) =>
      dispatch("nnsToggle", currentTarget.checked)}
    {checked}
    aria-label={ariaLabel}
  />
  <label for="toggle" />
</div>

<style lang="scss">
  .toggle input[type="checkbox"] {
    display: none;
  }

  .toggle {
    display: flex;
    // justify-content: center;
    align-items: center;
    margin-top: 1px;
  }

  .toggle label {
    background-color: var(--card-background-contrast);
    border-radius: 50px;
    cursor: pointer;
    display: inline-block;
    position: relative;
    transition: all ease-in-out 0.3s;
    width: var(--padding-4x);
    height: calc(var(--padding-2x) + 2px);
  }

  .toggle label::after {
    border-radius: 50%;
    content: "";
    cursor: pointer;
    display: inline-block;
    position: absolute;
    left: 2px;
    top: 1px;
    transition: all ease-in-out 0.3s;
    width: var(--padding-2x);
    height: var(--padding-2x);

    background: var(--card-background);
  }

  .toggle input[type="checkbox"]:checked ~ label::after {
    transform: translateX(calc(var(--padding-2x) - 4px));
  }
</style>
