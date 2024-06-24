<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { accountsPathStore } from "$lib/derived/paths.derived";
  import { isNnsUniverseStore } from "$lib/derived/selected-universe.derived";

  const back = (): Promise<void> =>
    goto($isNnsUniverseStore ? $accountsPathStore : AppPath.Tokens);
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutNavGuard>
