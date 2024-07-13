<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  const back = (): Promise<void> => goto(AppPath.Canisters);
</script>

<Layout>
  <Content {back}>
    <slot />
  </Content>
</Layout>
