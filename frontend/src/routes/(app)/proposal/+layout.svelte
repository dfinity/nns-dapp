<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { afterNavigate, goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));

  const back = (): Promise<void> =>
    goto(
      referrerPath === AppPath.Launchpad ? AppPath.Launchpad : AppPath.Proposals
    );
</script>

<Layout {back}>
  <slot />
</Layout>
