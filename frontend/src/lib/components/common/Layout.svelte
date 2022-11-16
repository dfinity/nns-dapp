<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import MenuItems from "./MenuItems.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { Layout, HeaderTitle, Content } from "@dfinity/gix-components";
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import { triggerDebugReport } from "$lib/services/debug.services";

  export let back: (() => Promise<void>) | undefined = undefined;

  export let contrast = false;
</script>

<Banner />

<Layout>
  <MenuItems slot="menu-items" />

  <Content
    back={back !== undefined}
    {contrast}
    on:nnsBack={async () => await back?.()}
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
