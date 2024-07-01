<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

<LayoutList title={$i18n.navigation.neurons}>
  <Layout>
    <UniverseSplitContent>
      <slot />
    </UniverseSplitContent>
  </Layout>
</LayoutList>
