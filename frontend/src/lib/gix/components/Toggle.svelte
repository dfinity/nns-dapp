<script lang="ts">
  // adapted from https://www.florin-pop.com/blog/2019/05/dark-light-theme-toggle/

  import { createEventDispatcher } from "svelte";
  import { nextElementId } from "$lib/gix/utils/html.utils";

  export let checked: boolean;
  export let ariaLabel: string;
  export let disabled = false;
  export let testId = "gix-cmp-toggle";

  const dispatch = createEventDispatcher();

  const id = nextElementId("toggle-");
</script>

<div class="toggle" class:disabled data-tid={testId}>
  <input
    {id}
    aria-label={ariaLabel}
    {checked}
    {disabled}
    type="checkbox"
    on:input={({ currentTarget }) =>
      dispatch("nnsToggle", currentTarget.checked)}
  />
  <label for={id}></label>
</div>

<style lang="scss">
  .toggle input[type="checkbox"] {
    display: none;
  }

  .toggle {
    display: inline-flex;
    // justify-content: center;
    align-items: center;
    margin-top: 1px;

    &.disabled {
      opacity: var(--toggle-disabled-opacity, 0.25);
    }
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
