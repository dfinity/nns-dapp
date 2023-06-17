<script lang="ts">
  import { markdownToHTML } from "$lib/utils/html.utils";
  import { Spinner, Html } from "@dfinity/gix-components";

  export let text: string | undefined;

  let html: string | undefined;
  let error = false;
  const transform = async (text: string) => {
    try {
      html = await markdownToHTML(text);
    } catch (err) {
      console.error(err);
      error = true;
    }
  };
  $: if (text !== undefined) transform(text).then();
</script>

{#if error}
  <p data-tid="markdown-text">{text}</p>
{:else if html === undefined}
  <Spinner inline />
{:else}
  <Html text={html} />
{/if}
