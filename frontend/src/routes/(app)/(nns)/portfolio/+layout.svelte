<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

<LayoutList title={$i18n.navigation.portfolio}>
  <Layout>
    <Content>
      <slot />
    </Content>
  </Layout>
</LayoutList>
