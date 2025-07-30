<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { accountsPageOrigin } from "$lib/derived/routes.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  // const back = (): Promise<void> => goto($accountsPageOrigin);
</script>

<Layout title={$i18n.navigation.tokens_account}>
  <Content>
    <IslandWidthMain>
      {@render children()}
    </IslandWidthMain>
  </Content>
</Layout>
