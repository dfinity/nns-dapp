<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { projectPageOrigin } from "$lib/derived/routes.derived";

  const back = (): Promise<void> => goto($projectPageOrigin);
</script>

<Layout>
  <Content {back}>
    <slot />
  </Content>
</Layout>
