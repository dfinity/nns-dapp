<script lang="ts">
  import Header from "./Header.svelte";
  import Nav from "./Nav.svelte";
  import Toasts from "../ui/Toasts.svelte";
</script>

<Header />

<Nav />

<main>
  <slot />
</main>

<footer>
  <slot name="footer" />
</footer>

<Toasts />

<style lang="scss">
  main {
    position: absolute;
    top: calc(var(--header-height) + var(--nav-height) + (2 * var(--padding)));
    left: 0;
    right: 0;
    bottom: 0;

    overflow: auto;
  }

  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    height: var(--footer-height);

    will-change: transform;
    pointer-events: none;

    background: linear-gradient(
      0deg,
      rgba(var(--black-rgb), 1) 10%,
      rgba(var(--black-rgb), 0) 100%
    );
  }
</style>
