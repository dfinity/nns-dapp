<script lang="ts">
  import Spinner from "./Spinner.svelte";
  import { markdownToSanitisedHTML } from "../../services/utils.services";

  export let text: string | undefined;

  let html: string | undefined;
  let error: boolean = false;
  const transform = async (text: string) => {
    try {
      html = await markdownToSanitisedHTML(text);
    } catch (err) {
      console.error(err);
      error = true;
    }
  };
  $: if (text !== undefined) transform(text);
</script>

{#if error}
  <p class="fallback">{text}</p>
{:else if html === undefined}
  <Spinner inline />
{:else}
  {@html html}
{/if}
