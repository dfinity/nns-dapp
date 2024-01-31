<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { accountsTitleStore } from "$lib/derived/accounts-title.derived";
  import { i18n } from "$lib/stores/i18n";
</script>

<LayoutList
  title={$ENABLE_MY_TOKENS ? $i18n.navigation.tokens : $accountsTitleStore}
>
  <Layout>
    {#if $ENABLE_MY_TOKENS}
      <Content>
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
