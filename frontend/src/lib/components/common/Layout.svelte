<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import MenuItems from "./MenuItems.svelte";
  import {
    layoutTitleStore,
    layoutBackStore,
    layoutMainStyleStore,
  } from "../../stores/layout.store";
  import { Layout, Title } from "@dfinity/gix-components";
  import AccountMenu from "../header/AccountMenu.svelte";
  import { triggerDebugReport } from "../../services/debug.services";

  let back = false;
  $: back = $layoutBackStore !== undefined;
</script>

<Banner />

<Layout
  {back}
  modern={$layoutMainStyleStore === "modern"}
  on:nnsBack={() => $layoutBackStore?.()}
>
  <div use:triggerDebugReport slot="title">
    <Title>{$layoutTitleStore}</Title>
  </div>

  <MenuItems slot="menu-items" />

  <AccountMenu slot="toolbar-end" />

  <slot />
</Layout>
