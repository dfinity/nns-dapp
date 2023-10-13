<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

<LayoutList title={$i18n.sns_launchpad.header}>
  <Layout>
    <Content>
      <slot />
    </Content>
  </Layout>
</LayoutList>
