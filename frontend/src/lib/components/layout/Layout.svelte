<script lang="ts">
  import MenuItems from "$lib/components/common/MenuItems.svelte";
  import Banner from "$lib/components/header/Banner.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { Layout } from "@dfinity/gix-components";

  export let title: string = "";
  layoutTitleStore.set({
    title,
  });
</script>

<Banner />

<Layout>
  <MenuItems slot="menu-items" />

  <slot />
</Layout>
