<script lang="ts">
  import { Copy, KeyValuePair } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  let fee;
</script>

<KeyValuePair>
  <span slot="key" class="label">{$i18n.ckbtc.kyt_fee}</span>
  <div slot="value" class="address">
    <span class="value" data-tid="qrcode-display-address">{fee}</span>
    <Copy value={fee ?? ""} />
  </div>
</KeyValuePair>
