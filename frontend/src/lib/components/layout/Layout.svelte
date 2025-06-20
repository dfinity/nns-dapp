<script lang="ts">
  import MenuItems from "$lib/components/common/MenuItems.svelte";
  import Banner from "$lib/components/header/Banner.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { Layout } from "@dfinity/gix-components";
  import type { Snippet } from "svelte";

  type Props = {
    title?: string;
    children: Snippet;
  };
  const { title = "", children }: Props = $props();

  title &&
    layoutTitleStore.set({
      title,
    });
</script>

<Banner />

<Layout>
  <MenuItems slot="menu-items" />
  {@render children()}
</Layout>
