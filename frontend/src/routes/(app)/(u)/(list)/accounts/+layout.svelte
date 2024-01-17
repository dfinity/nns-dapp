<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { accountsTitleStore } from "$lib/derived/accounts-title.derived";

  const back = (): Promise<void> => goto(AppPath.Tokens);
</script>

<LayoutList title={$accountsTitleStore}>
  <Layout>
    {#if $ENABLE_MY_TOKENS}
      <Content {back}>
        <MainWrapper>
          <slot />
        </MainWrapper>
      </Content>
    {:else}
      <UniverseSplitContent>
        <slot />
      </UniverseSplitContent>
    {/if}
  </Layout>
</LayoutList>
