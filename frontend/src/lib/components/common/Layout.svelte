<script lang="ts">
  import Banner from "../header/Banner.svelte";
  import MenuItems from "./MenuItems.svelte";
  import { Layout } from "@dfinity/gix-components";
</script>

<Banner />

<Layout>
  <MenuItems slot="menu-items" />

  <slot />
</Layout>
