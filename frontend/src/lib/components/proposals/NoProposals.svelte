<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { fade } from "svelte/transition";
</script>

<p class="description" data-tid="no-proposals-msg" in:fade|global>
  {$i18n.voting.nothing_found}
</p>
