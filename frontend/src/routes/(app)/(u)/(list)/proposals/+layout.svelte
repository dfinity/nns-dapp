<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import { i18n } from "$lib/stores/i18n";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
</script>

<LayoutList title={$i18n.navigation.voting}>
  <Layout>
    <UniverseSplitContent>
      <slot />
    </UniverseSplitContent>
  </Layout>
</LayoutList>
