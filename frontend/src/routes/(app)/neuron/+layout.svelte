<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { goto } from "$app/navigation";
  import { neuronsPathStore } from "$lib/derived/paths.derived";

  const back = (): Promise<void> => goto($neuronsPathStore);
</script>

<Layout {back}>
  <slot />
</Layout>
