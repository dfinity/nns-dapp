<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import MenuItems from "./MenuItems.svelte";
  import { layoutTitleStore, layoutBackStore } from "$lib/stores/layout.store";
  import { Layout, HeaderTitle } from "@dfinity/gix-components";
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import { triggerDebugReport } from "$lib/services/debug.services";

  let back = false;
  $: back = $layoutBackStore !== undefined;
</script>

<Banner />

<Layout {back} on:nnsBack={() => $layoutBackStore?.()}>
  <div use:triggerDebugReport slot="title">
    <HeaderTitle>{$layoutTitleStore}</HeaderTitle>
  </div>

  <MenuItems slot="menu-items" />

  <AccountMenu slot="toolbar-end" />

  <slot />
</Layout>

<style lang="scss">
  div {
    max-width: inherit;
  }
</style>
