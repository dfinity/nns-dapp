<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { goto } from "$app/navigation";
  import { accountsPathStore } from "$lib/derived/paths.derived";

  const back = (): Promise<void> => goto($accountsPathStore);
</script>

<Layout contrast {back}>
  <slot />
</Layout>
