<script lang="ts">
  import Footer from "./Footer.svelte";
  import Header from "../header/Header.svelte";
  import Banner from "../header/Banner.svelte";
  import MenuButton from "../header/MenuButton.svelte";
  import Menu from "./Menu.svelte";
  import Back from "../header/Back.svelte";
  import SplitPane from "../ui/SplitPane.svelte";

  export let layout: "old-main" | "old-detail" | "detail" | "main" = "old-main";

  let showFooter: boolean;
  $: showFooter = $$slots.footer;

  let open: boolean;
  let sticky: boolean;
</script>

<Banner />

<SplitPane bind:sticky>
  <Header slot="header">
    <svelte:fragment slot="start">
      {#if layout === "detail" || layout === "old-detail"}
        <Back on:nnsBack />
      {:else}
        <MenuButton bind:open />
      {/if}
    </svelte:fragment>

    <svelte:fragment><slot name="header" /></svelte:fragment>
  </Header>

  <Menu slot="menu" bind:open {sticky} />

  <main class={layout}>
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

    &.old-detail,
    &.old-main {
      --section-max-width: 800px;
      --section-padding: var(--padding-2x) var(--padding-2x)
        var(--footer-height);
    }
  }
</style>
