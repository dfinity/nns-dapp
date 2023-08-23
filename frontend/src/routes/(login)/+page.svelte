<script lang="ts">
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import LayoutList from "$lib/components/layout/LayoutList.svelte";
  import Warnings from "$lib/components/warnings/Warnings.svelte";
  import SignInAccounts from "$lib/pages/SignInAccounts.svelte";
  import { i18n } from "$lib/stores/i18n";
</script>

<Warnings ckBTCWarnings testEnvironmentWarning />

<LayoutList title={$i18n.navigation.tokens}>
  <Layout>
    <Content>
      <SignInAccounts />
    </Content>
  </Layout>
</LayoutList>
