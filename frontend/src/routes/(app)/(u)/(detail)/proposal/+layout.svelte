<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutNavGuard from "$lib/components/layout/LayoutNavGuard.svelte";
  import { proposalsPageOrigin } from "$lib/derived/routes.derived";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const back = async () => goto($proposalsPageOrigin);
</script>

<LayoutNavGuard>
  <Layout>
    <Content {back}>
      {@render children()}
    </Content>
  </Layout>
</LayoutNavGuard>
