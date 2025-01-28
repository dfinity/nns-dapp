<script lang="ts">
  import { goto } from "$app/navigation";
  import Content from "$lib/components/layout/Content.svelte";
  import Layout from "$lib/components/layout/Layout.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { referrerPathStore } from "$lib/stores/routes.store";

  const back = async () => {
    if ($referrerPathStore.length > 0) {
      // Referrer might be a detail page which needs query parameters therefore we use the browser API to go back there
      history.back();
      return;
    }

    // We landed on the "Settings" page from somewhere else than from the dapp
    await goto(AppPath.Accounts);
  };
</script>

<Layout>
  <Content {back}>
    <slot />
  </Content>
</Layout>
