<script lang="ts">
  import Spinner from "./Spinner.svelte";
  import { markdownToHTML } from "../../utils/markdown.utils";
  import { i18n } from "../../stores/i18n";
  import { sanitize } from "../../utils/security.utils";

  export let text: string | undefined;

  let html: string | undefined;
  $: {
    if (text !== undefined) {
      Promise.all([sanitize(), markdownToHTML()])
        .then(
          ([sanitize, markdownToHTML]) =>
            (html = markdownToHTML(sanitize(text ?? "")))
        )
        .catch((error) => {
          console.error(error);
          html = $i18n.error.fail;
        });
    }
  }
</script>

{#if html === undefined}
  <Spinner inline />
{:else}
  {@html html}
{/if}
