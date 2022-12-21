<script lang="ts">
import { i18n } from "$lib/stores/i18n";
import BadgeNew from "$lib/components/ui/BadgeNew.svelte";
</script>

<h2>{$i18n.canisters.wapps}<BadgeNew /></h2>

<div>
  <p>
    "Wallet Apps" = new blockchain phenomenon coming on Internet Computer. Try it now!
  </p>

  <button class="primary">Install wApp</button>
</div>

<style lang="scss">
  h2 {
    margin: var(--padding-2x) 0;
    display: inline-flex;
    align-items: center;
    gap: var(--padding);
  }

  div {
    margin: 0 0 var(--padding-4x);
  }

  button {
    margin: var(--padding) 0 0;
  }
</style>