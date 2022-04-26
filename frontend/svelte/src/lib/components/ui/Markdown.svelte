<script lang="ts">
  import type { marked } from "marked";
  import Spinner from "./Spinner.svelte";
  import { renderer } from "../../utils/markdown.utils";
  type Marked = typeof marked;

  export let text: string | undefined;

  let sanitisedText: string | undefined;
  $: text,
    (async () => {
      sanitisedText = text === undefined ? undefined : await sanitize(text);
    })();

  const sanitize = async (text: string): Promise<string> => {
    const purifyUrl = "/assets/assets/libs/purify.min.js";
    const { sanitize: purify } = (await import(purifyUrl)).default;
    const markedUrl = "/assets/assets/libs/marked.min.js";
    const { marked }: { marked: Marked } = await import(markedUrl);

    return marked(purify(text), {
      renderer: renderer(marked),
    });
  };
</script>

{#if sanitisedText === undefined}
  <Spinner inline />
{:else}
  {@html sanitisedText}
{/if}
