<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import type { LayoutData } from './$types'

  export let data: LayoutData;

  $: (() => {
    const {universe, id} = data;

    // TODO(GIX-1071)
  })();
</script>

<Layout>
  <slot />
</Layout>
