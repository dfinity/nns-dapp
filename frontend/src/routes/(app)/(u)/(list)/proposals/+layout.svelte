<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import type { ComponentType } from "svelte";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";

  let cmp: ComponentType;
  $: cmp = $ENABLE_SNS_VOTING ? UniverseSplitContent : Content;
</script>

<Layout>
  <svelte:component this={cmp}>
    <slot />
  </svelte:component>
</Layout>
