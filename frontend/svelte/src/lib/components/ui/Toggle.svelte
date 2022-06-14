<script lang="ts">
  // adapted from https://www.florin-pop.com/blog/2019/05/dark-light-theme-toggle/

  import { createEventDispatcher } from "svelte";

  export let checked: boolean;

  const dispatch = createEventDispatcher();
</script>

<div class="toggle" aria-label="Switch theme">
  <input
    type="checkbox"
    id="toggle"
    on:input={({ currentTarget }) =>
      dispatch("nnsToggle", currentTarget.checked)}
    {checked}
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
    background-color: var(--background);
    border: 2px solid var(--background-shade);
    border-radius: 50px;
    cursor: pointer;
    display: inline-block;
    position: relative;
    transition: all ease-in-out 0.3s;
    width: 32px;
    height: 16px;
  }

  .toggle label::after {
    border-radius: 50%;
    content: "";
    cursor: pointer;
    display: inline-block;
    position: absolute;
    left: 0;
    top: 1px;
    transition: all ease-in-out 0.3s;
    width: 14px;
    height: 14px;

    background-color: var(--gray-600);
    /** source: https://fonts.google.com/icons?selected=Material%20Icons%3Adark_mode%3A */
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='14px' viewBox='0 0 24 24' width='14px' fill='currentColor' %3E%3Crect fill='none' height='24' width='24' /%3E%3Cpath d='M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36c-0.98,1.37-2.58,2.26-4.4,2.26 c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z' /%3E%3C/svg%0A%3E");
  }

  .toggle input[type="checkbox"]:checked ~ label {
    background-color: var(--light-background);
  }

  .toggle input[type="checkbox"]:checked ~ label::after {
    transform: translateX(14px);

    background-color: var(--yellow-400);
    /** source: https://fonts.google.com/icons?selected=Material%20Icons%20Outlined%3Alight_mode%3A */
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='14px' viewBox='0 0 24 24' width='14px' fill='currentColor' %3E%3Crect fill='none' height='24' width='24' /%3E%3Cpath d='M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z' /%3E%3C/svg%0A%3E");
  }
</style>
