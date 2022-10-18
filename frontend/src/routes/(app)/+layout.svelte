<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { type Page, pageStore } from "$lib/stores/page.store";

  // Preloaded by +layout.ts
  export let data: Partial<Page>;

  $: (() => pageStore.load(data))();
</script>

<Layout>
  <slot />
</Layout>
