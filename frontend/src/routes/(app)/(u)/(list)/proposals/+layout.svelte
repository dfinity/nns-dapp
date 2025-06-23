<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  const { children }: Props = $props();
</script>

<Layout title={$i18n.navigation.voting}>
  <UniverseSplitContent resetScrollPositionAfterNavigation>
    {@render children()}
  </UniverseSplitContent>
</Layout>
