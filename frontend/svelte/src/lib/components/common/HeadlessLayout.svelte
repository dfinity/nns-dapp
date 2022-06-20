<script lang="ts">
  import Footer from "./Footer.svelte";
  import Banner from "./Banner.svelte";
  import HeadlessLayoutHeader from "./HeadlessLayoutHeader.svelte";

  export let showFooter = true;
</script>

<Banner headless={true} />

<HeadlessLayoutHeader on:nnsBack>
  <svelte:fragment><slot name="header" /></svelte:fragment>
</HeadlessLayoutHeader>

<main>
  <slot />
</main>

{#if showFooter}
  <Footer>
    <slot name="footer" />
  </Footer>
{/if}

<style lang="scss">
  main {
    position: absolute;

    inset: var(--header-height) 0 0;

    overflow-y: auto;
    overflow-x: hidden;

    background-color: var(--gray-50-background);
  }
</style>
