<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { proposalsPageOrigin } from "$lib/derived/routes.derived";

  const back = async () => goto($proposalsPageOrigin);
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutNavGuard>
