<script lang="ts">
  import Banner from "$lib/components/header/Banner.svelte";
  import MenuItems from "$lib/components/common/MenuItems.svelte";
  import { Layout } from "@dfinity/gix-components";
</script>

<Banner />

<Layout>
  <MenuItems slot="menu-items" />

  <slot />
</Layout>
