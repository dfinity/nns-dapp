<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import type { SvelteComponent } from "svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { i18n } from "$lib/stores/i18n";

  let cmp: typeof SvelteComponent;
  $: cmp = $authSignedInStore ? UniverseSplitContent : Content;
</script>

<LayoutList title={$i18n.navigation.neurons}>
  <Layout>
    <svelte:component this={cmp}>
      <slot />
    </svelte:component>
  </Layout>
</LayoutList>
