<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal | undefined;
</script>

<h5>{$i18n.canister_detail.title}</h5>
<p class="value">{canisterId?.toText()}</p>
