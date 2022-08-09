<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import MenuItems from "./MenuItems.svelte";
  import {
    layoutTitleStore,
    layoutBackStore,
    layoutMainStyleStore,
  } from "../../stores/layout.store";
  import { Layout } from "@dfinity/gix-components";
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
  <h4 use:triggerDebugReport slot="title">{$layoutTitleStore}</h4>

  <MenuItems slot="menu-items" />

  <AccountMenu slot="toolbar-end" />

  <slot />
</Layout>
