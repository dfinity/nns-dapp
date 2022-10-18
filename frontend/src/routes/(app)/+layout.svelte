<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import type { LayoutData } from "./$types";
  import { routesStore } from "$lib/stores/routes.stores";

  export let data: LayoutData;

  $: (() => {
    const { universe, id } = data;
    routesStore.load({ universe, id });
  })();
</script>

<Layout>
  <slot />
</Layout>
