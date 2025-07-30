<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();
</script>

<Layout title={$i18n.navigation.voting}>
  <!-- TODO(icp): check this functionality if required <UniverseSplitContent resetScrollPositionAfterNavigation> -->
  <Content>
    <IslandWidthMain>
      {@render children()}
    </IslandWidthMain>
  </Content>
</Layout>
