<script lang="ts">
  import Layout from "$lib/components/layout/Layout.svelte";
  import Content from "$lib/components/layout/Content.svelte";
  import { afterNavigate, goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import { nonNullish } from "@dfinity/utils";

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));

  const back = async () => {
    if (nonNullish(referrerPath)) {
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
