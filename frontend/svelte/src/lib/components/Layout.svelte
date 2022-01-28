<script lang="ts">
  import Header from "./Header.svelte";
  import Nav from "./Nav.svelte";
</script>

<Header />

<Nav />

<main>
  <slot />
</main>

<style lang="scss">
  main {
    position: absolute;
    top: calc(var(--header-height) + var(--nav-height) + (2 * var(--padding)));
    left: 0;
    right: 0;
    bottom: 0;

    overflow: auto;
  }
</style>
