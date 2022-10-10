<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal | undefined;
</script>

<p class="label">{$i18n.canister_detail.title}</p>
<p class="value">{canisterId?.toText()}</p>
