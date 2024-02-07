<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { accountsTitleStore } from "$lib/derived/accounts-title.derived";

  const back = (): Promise<void> => goto(AppPath.Tokens);
</script>

<LayoutList title={$accountsTitleStore}>
  <Layout>
    <Content {back}>
      <MainWrapper>
        <slot />
      </MainWrapper>
    </Content>
  </Layout>
</LayoutList>
