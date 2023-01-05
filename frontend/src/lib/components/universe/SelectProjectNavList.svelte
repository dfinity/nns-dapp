<script lang="ts">
  import SelectProjectList from "$lib/components/universe/SelectProjectList.svelte";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";

  export let selectedCanisterId: string;
</script>

<SelectProjectList
  {selectedCanisterId}
  on:nnsSelectProject={async ({ detail }) =>
    await goto(buildSwitchUniverseUrl(detail))}
/>
