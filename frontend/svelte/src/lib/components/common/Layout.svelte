<script lang="ts">
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import Nav from "./Nav.svelte";
  import Toasts from "../ui/Toasts.svelte";
  import Banner from "./Banner.svelte";
</script>

<Banner />

<Header />

<Nav />

<main>
  <slot />
</main>

<Footer>
  <slot name="footer" />
</Footer>

<Toasts />

<style lang="scss">
  main {
    position: absolute;
    top: calc(var(--header-offset, 0px) + var(--header-height) + var(--nav-height) + (2 * var(--padding)));
    left: 0;
    right: 0;
    bottom: 0;

    overflow: auto;
  }
</style>
