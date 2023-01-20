<script lang="ts">
  import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
</script>

<SelectUniverseList
  on:nnsSelectProject={async ({ detail }) =>
    await goto(buildSwitchUniverseUrl(detail))}
/>
