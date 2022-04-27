<script lang="ts">
  import Spinner from "./Spinner.svelte";
  import { markdownToSanitizedHTML } from "../../services/utils.services";

  export let text: string | undefined;

  let html: string | undefined;
  let error: boolean = false;
  const transform = async (text: string) => {
    try {
      html = await markdownToSanitizedHTML(text);
    } catch (err) {
      console.error(err);
      error = true;
    }
  };
  $: if (text !== undefined) transform(text);
</script>

{#if error}
  <p data-tid="markdown-text">{text}</p>
{:else if html === undefined}
  <Spinner inline />
{:else}
  {@html html}
{/if}
