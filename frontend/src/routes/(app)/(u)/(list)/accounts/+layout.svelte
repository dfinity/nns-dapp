<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import type { SvelteComponent } from "svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";

  let cmp: typeof SvelteComponent;
  $: cmp = $authSignedInStore ? UniverseSplitContent : Content;
</script>

<LayoutList title={$i18n.navigation.tokens}>
  <Layout>
    <svelte:component this={cmp}>
      <slot />
    </svelte:component>
  </Layout>
</LayoutList>
