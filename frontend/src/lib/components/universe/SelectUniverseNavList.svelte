<script lang="ts">
  import { goto } from "$app/navigation";
  import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
  import {
    ACTIONABLE_PROPOSALS_URL,
    buildSwitchUniverseUrl,
  } from "$lib/utils/navigation.utils";
</script>

<SelectUniverseList
  on:nnsSelectUniverse={async ({ detail }) =>
    await goto(buildSwitchUniverseUrl(detail))}
  on:nnsSelectActionable={async () => await goto(ACTIONABLE_PROPOSALS_URL)}
/>
