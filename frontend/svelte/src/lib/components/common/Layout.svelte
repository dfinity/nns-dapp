<script lang="ts">
  import Footer from "./Footer.svelte";
  import LayoutHeader from "./LayoutHeader.svelte";
  import Banner from "./Banner.svelte";
</script>

<Banner />

<LayoutHeader />

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
