<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import UniverseSplitContent from "$lib/components/layout/UniverseSplitContent.svelte";
  import { i18n } from "$lib/stores/i18n";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { ENABLE_MY_TOKENS } from "$lib/stores/feature-flags.store";
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
  import Content from "$lib/components/layout/Content.svelte";
</script>

<LayoutList title={$i18n.navigation.tokens}>
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
