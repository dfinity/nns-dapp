<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";

  const back = (): Promise<void> => goto(AppPath.Launchpad);
</script>

<Layout>
  <Content {back}>
    <slot />
  </Content>
</Layout>
