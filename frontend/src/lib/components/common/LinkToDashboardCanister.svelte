<script lang="ts">
  import { IconOpenInNew } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal;

  let href: string;
  $: href = replacePlaceholders($i18n.import_token.link_to_dashboard, {
    $canisterId: canisterId.toText(),
  });
</script>

<a
  class="button ghost with-icon"
  data-tid="link-to-dashboard-canister-component"
  {href}
  target="_blank"
  rel="noopener noreferrer"
>
  <IconOpenInNew />
  {$i18n.import_token.view_in_dashboard}
</a>
