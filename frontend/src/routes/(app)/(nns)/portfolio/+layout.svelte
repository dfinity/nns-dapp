<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();
</script>

<LayoutList title={$i18n.navigation.portfolio}>
  <Layout>
    <Content>
      {@render children()}
    </Content>
  </Layout>
</LayoutList>
