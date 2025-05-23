<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { neuronsPathStore } from "$lib/derived/paths.derived";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const back = (): Promise<void> => goto($neuronsPathStore);
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      {@render children()}
    </Content>
  </Layout>
</LayoutNavGuard>
