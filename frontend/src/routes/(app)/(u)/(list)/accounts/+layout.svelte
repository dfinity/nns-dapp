<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { accountsTitleStore } from "$lib/derived/accounts-title.derived";

  const back = (): Promise<void> => goto(AppPath.Tokens);
</script>

<LayoutList title={$accountsTitleStore}>
  <Layout>
    <Content {back}>
      <IslandWidthMain>
        <slot />
      </IslandWidthMain>
    </Content>
  </Layout>
</LayoutList>
