<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal | undefined;
</script>

<div>
  <p class="label">{$i18n.canister_detail.title}</p>
  <p class="value">{canisterId?.toText()}</p>
</div>

<style lang="scss">
  .label {
    margin: 0;
  }

  .value {
    margin-top: 0;
  }
</style>
