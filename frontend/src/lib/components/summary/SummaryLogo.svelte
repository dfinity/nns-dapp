<script lang="ts">
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import type { Universe } from "$lib/types/universe";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";

  export let displayUniverse = true;

  let universe: Universe;
  $: universe = displayUniverse ? $selectedUniverseStore : $nnsUniverseStore;
</script>

<UniverseLogo {universe} framed />
