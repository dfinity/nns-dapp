<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { accountsTitleStore } from "$lib/derived/accounts-title.derived";
  import { accountsPageOrigin } from "$lib/derived/routes.derived";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const back = (): Promise<void> => goto($accountsPageOrigin);
</script>

<LayoutList title={$accountsTitleStore}>
  <Layout>
    <Content {back}>
      <IslandWidthMain>
        {@render children()}
      </IslandWidthMain>
    </Content>
  </Layout>
</LayoutList>
