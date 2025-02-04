<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { walletPageOrigin } from "$lib/derived/routes.derived";

  const back = (): Promise<void> => goto($walletPageOrigin);
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutNavGuard>
