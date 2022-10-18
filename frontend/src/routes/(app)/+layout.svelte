<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { type Page, pageStore } from "$lib/stores/page.store";

  export let data: Partial<Page>;

  $: (() => {
    const { universe, id } = data;
    pageStore.load({ universe, id });
  })();
</script>

<Layout>
  <slot />
</Layout>
