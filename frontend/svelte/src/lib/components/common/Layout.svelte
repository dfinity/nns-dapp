<script lang="ts">
  import Footer from "./Footer.svelte";
  import Header from "./Header.svelte";
  import Banner from "./Banner.svelte";
  import MenuButton from "./MenuButton.svelte";
  import Menu from "./Menu.svelte";
  import SplitPane from "../ui/SplitPane.svelte";

  let open: boolean;
</script>

<Banner />

<SplitPane>
  <Header slot="header">
    <MenuButton slot="start" bind:open />
    <svelte:fragment><slot name="header" /></svelte:fragment>
  </Header>

  <Menu slot="menu" bind:open />

  <main>
    <slot />
  </main>

  <Footer>
    <slot name="footer" />
  </Footer>
</SplitPane>

<style lang="scss">
  main {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
