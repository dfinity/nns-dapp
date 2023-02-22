<script lang="ts">
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import type { AppPath } from "$lib/constants/routes.constants";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import { afterNavigate } from "$app/navigation";
  import Proposals from "$lib/routes/Proposals.svelte";

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));

  onMount(() => layoutTitleStore.set($i18n.navigation.voting));
</script>

<Proposals {referrerPath} />
