<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { ENABLE_PORTFOLIO_PAGE } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const title = $ENABLE_PORTFOLIO_PAGE
    ? $i18n.navigation.portfolio
    : $i18n.navigation.tokens;
</script>

<LayoutList {title}>
  <Layout>
    <Content>
      {#if $ENABLE_PORTFOLIO_PAGE}
        {@render children()}
      {:else}
        <IslandWidthMain>
          {@render children()}
        </IslandWidthMain>
      {/if}
    </Content>
  </Layout>
</LayoutList>
