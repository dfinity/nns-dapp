<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { goto } from "$app/navigation";
  import { accountsPathStore } from "$lib/derived/paths.derived";
  import { Island } from '@dfinity/gix-components';

  const back = (): Promise<void> => goto($accountsPathStore);
</script>

<Layout {back}>
  <Island>
    <slot />
  </Island>
</Layout>
