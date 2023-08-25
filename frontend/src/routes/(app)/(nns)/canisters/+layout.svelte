<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { authSignedInStore } from "$lib/derived/auth.derived";
</script>

<LayoutList title={$i18n.navigation.canisters} showHeader={$authSignedInStore}>
  <Layout>
    <Content>
      <slot />
    </Content>
  </Layout>
</LayoutList>
