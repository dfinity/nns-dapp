<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();
</script>

<LayoutList title={$i18n.navigation.voting}>
  <Layout>
    <UniverseSplitContent resetScrollPositionAfterNavigation>
      {@render children()}
    </UniverseSplitContent>
  </Layout>
</LayoutList>
