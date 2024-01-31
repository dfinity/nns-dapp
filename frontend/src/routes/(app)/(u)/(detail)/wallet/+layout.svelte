<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import {
    accountsPathStore,
    tokensPathStore,
  } from "$lib/derived/paths.derived";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";

  const back = (): Promise<void> =>
    goto($isNnsUniverseStore ? $accountsPathStore : $tokensPathStore);
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutNavGuard>
