<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import type { SvelteComponent } from "svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  let cmp: typeof SvelteComponent;
  $: cmp = $authSignedInStore ? UniverseSplitContent : Content;
</script>

<Layout>
  <svelte:component this={cmp}>
    <slot />
  </svelte:component>
</Layout>
