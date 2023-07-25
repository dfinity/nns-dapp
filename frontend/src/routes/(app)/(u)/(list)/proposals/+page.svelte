<script lang="ts">
  import type { AppPath } from "$lib/constants/routes.constants";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import { afterNavigate } from "$app/navigation";
  import Proposals from "$lib/routes/Proposals.svelte";

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));
</script>

<Proposals {referrerPath} />
