<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";

  const back = (): Promise<void> => goto($neuronsPathStore);
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      <slot />
    </Content>
  </Layout>
</LayoutNavGuard>
