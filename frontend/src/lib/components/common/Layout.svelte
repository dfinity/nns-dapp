<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import MenuItems from "./MenuItems.svelte";
  import { layoutTitleStore, layoutBackStore } from "$lib/stores/layout.store";
  import { Layout, HeaderTitle, Content } from "@dfinity/gix-components";
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import { triggerDebugReport } from "$lib/services/debug.services";

  let back = false;
  $: back = $layoutBackStore !== undefined;

  export let contrast = false;
</script>

<Banner />

<Layout>
  <MenuItems slot="menu-items" />

  <Content
    {back}
    {contrast}
    on:nnsBack={async () => await $layoutBackStore?.()}
  >
    <div use:triggerDebugReport slot="title">
      <HeaderTitle>{$layoutTitleStore}</HeaderTitle>
    </div>

    <AccountMenu slot="toolbar-end" />

    <slot />
  </Content>
</Layout>

<style lang="scss">
  div {
    max-width: inherit;
  }
</style>
