<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import type { PageData } from './$types'

  export let data: PageData;

  $: (() => {
    const {u, id} = data;

    // TODO
  })();
</script>

<Layout>
  <slot />
</Layout>
