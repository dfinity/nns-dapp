<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { accountsPathStore } from "$lib/derived/paths.derived";

  const back = (): Promise<void> => goto($accountsPathStore);
</script>

<Layout>
  <Content {back}>
    <slot />
  </Content>
</Layout>
