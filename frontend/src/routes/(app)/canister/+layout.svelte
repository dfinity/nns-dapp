<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import Content from "$lib/components/common/Content.svelte";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";

  const back = (): Promise<void> => goto(AppPath.Canisters);
</script>

<Layout>
  <Content {back}>
    <slot />
  </Content>
</Layout>
