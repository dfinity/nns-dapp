<script lang="ts">
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import Banner from "./Banner.svelte";
  import Menu from "./Menu.svelte";
</script>

<Banner />

<Header>
  <Menu slot="start" />
  <svelte:fragment><slot name="header" /></svelte:fragment>
</Header>

<main>
  <slot />
</main>

<Footer>
  <slot name="footer" />
</Footer>

<style lang="scss">
  main {
    position: absolute;
    top: calc(var(--header-offset, 0px) + var(--header-height));
    left: 0;
    right: 0;
    bottom: 0;

    overflow: auto;
  }
</style>
