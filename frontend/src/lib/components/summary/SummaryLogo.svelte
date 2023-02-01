<script lang="ts">
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import type { Universe } from "$lib/types/universe";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";

  export let displayUniverse = true;

  let universe: Universe;
  $: universe = displayUniverse ? $selectedUniverseStore : NNS_UNIVERSE;
</script>

<UniverseLogo {universe} framed />
