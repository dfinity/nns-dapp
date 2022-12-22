<script lang="ts">
  import { Html } from "@dfinity/gix-components";
  import {
    INSTALL_WAPP_CONTEXT_KEY,
    type InstallWAppContext,
  } from "$lib/types/install-wapp.context";
  import { getContext } from "svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { valueSpan } from "$lib/utils/utils";
  import { formatToken, numberToE8s } from "$lib/utils/token.utils";

  const { store }: InstallWAppContext = getContext<InstallWAppContext>(
    INSTALL_WAPP_CONTEXT_KEY
  );

  export let selectText = true;

  let text: string;
  $: text = `${$i18n.wapps.install_wapp_fee}${
    selectText ? ` ${$i18n.wapps.select_account}` : ""
  }`;
</script>

{#if $store.amount !== undefined}
  <Html
    text={replacePlaceholders(text, {
      $amount: valueSpan(
        formatToken({
          value: numberToE8s($store.amount),
        })
      ),
    })}
  />
{/if}
