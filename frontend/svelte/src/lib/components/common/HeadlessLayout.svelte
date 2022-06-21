<script lang="ts">
  import Footer from "./Footer.svelte";
  import Banner from "./Banner.svelte";
  import Header from "./Header.svelte";
  import Back from "./Back.svelte";
  import Menu from "./Menu.svelte";
  import SplitPane from "../ui/SplitPane.svelte";

  export let showFooter = true;
  let sticky: boolean;
</script>

<Banner />

<!-- TODO: refactor / merge <Layout /> and <HeadlessLayout /> -->

<SplitPane bind:sticky>
  <Header slot="header">
    <Back slot="start" on:nnsBack />
    <svelte:fragment><slot name="header" /></svelte:fragment>
  </Header>

  <Menu slot="menu" {sticky} />

  <main>
    <slot />
  </main>

  {#if showFooter}
    <Footer>
      <slot name="footer" />
    </Footer>
  {/if}
</SplitPane>

<style lang="scss">
  main {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
