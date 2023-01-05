<script lang="ts">
  import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";

  export let selectedCanisterId: string;
</script>

<SelectUniverseList
  {selectedCanisterId}
  on:nnsSelectProject={async ({ detail }) =>
    await goto(buildSwitchUniverseUrl(detail))}
/>
