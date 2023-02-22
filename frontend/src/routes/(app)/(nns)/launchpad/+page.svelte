<script lang="ts">
  import { onMount } from "svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import Launchpad from "$lib/pages/Launchpad.svelte";

  onMount(async () => {
    layoutTitleStore.set($i18n.sns_launchpad.header);
  });
</script>

<Launchpad />
