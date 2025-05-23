<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { neuronsPageOrigin } from "$lib/derived/routes.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();

  const back = (): Promise<void> => goto($neuronsPageOrigin);
</script>

<LayoutList title={$i18n.navigation.neurons}>
  <Layout>
    <Content {back}>
      {@render children()}
    </Content>
  </Layout>
</LayoutList>
