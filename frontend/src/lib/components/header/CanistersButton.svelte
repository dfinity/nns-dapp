<script lang="ts">
  import { goto } from "$app/navigation";
  import { i18n } from "$lib/stores/i18n";
  import { IconExplore } from "@dfinity/gix-components";
  import { canistersPathStore } from "$lib/derived/paths.derived";
</script>

<button
  data-tid="canisters-button"
  on:click={async () => {
    await goto($canistersPathStore);
  }}
  class="text"
>
  <IconExplore />
  {$i18n.navigation.canisters}
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  button {
    @include account-menu.button;
    padding: 0;
  }
</style>
