<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import { i18n } from "$lib/stores/i18n";
  import MainWrapper from "$lib/components/tokens/MainWrapper.svelte";
</script>

<LayoutList title={$i18n.navigation.tokens}>
  <Layout>
    <Content>
      <MainWrapper>
        <slot />
      </MainWrapper>
    </Content>
  </Layout>
</LayoutList>
