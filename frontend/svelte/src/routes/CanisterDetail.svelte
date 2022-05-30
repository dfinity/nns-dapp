<script lang="ts">
  import { onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import {
    AppPath,
    SHOW_CANISTERS_ROUTE,
  } from "../lib/constants/routes.constants";
  import { i18n } from "../lib/stores/i18n";
  import { routeStore } from "../lib/stores/route.store";

  onMount(async () => {
    if (!SHOW_CANISTERS_ROUTE) {
      window.location.replace("/#/canisters");
    }
  });

  const goBack = () => {
    routeStore.navigate({
      path: AppPath.Canisters,
    });
  };
  // TODO: setup details page: https://dfinity.atlassian.net/browse/L2-334
  // TODO: canister details card UI: https://dfinity.atlassian.net/browse/L2-599
</script>

{#if SHOW_CANISTERS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header"
      >{$i18n.canister_detail.title}</svelte:fragment
    >
    <section />
  </HeadlessLayout>
{/if}
