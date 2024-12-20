<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { ENABLE_PORTFOLIO_PAGE } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";

  const title = $ENABLE_PORTFOLIO_PAGE
    ? $i18n.navigation.portfolio
    : $i18n.navigation.tokens;
</script>

<LayoutList {title}>
  <Layout>
    <Content>
      <IslandWidthMain>
        <slot />
      </IslandWidthMain>
    </Content>
  </Layout>
</LayoutList>
