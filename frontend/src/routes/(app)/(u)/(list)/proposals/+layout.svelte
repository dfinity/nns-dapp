<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import type { SvelteComponent } from "svelte";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";

  let cmp: typeof SvelteComponent;
  $: cmp = $ENABLE_SNS_VOTING ? UniverseSplitContent : Content;
</script>

<LayoutList title={$i18n.navigation.voting}>
  <Layout>
    <svelte:component this={cmp}>
      <slot />
    </svelte:component>
  </Layout>
</LayoutList>
