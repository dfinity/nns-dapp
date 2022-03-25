<script lang="ts">
  import type { marked } from "marked";
  import ScriptLoader from "../common/ScriptLoader.svelte";
  import Spinner from "./Spinner.svelte";
  import { removeHTMLTags } from "../../utils/security.utils";
  import { renderer } from "../../utils/markdown.utils";
  type Marked = typeof marked;

  export let text: string | undefined;

  // do not load the lib if available
  /* eslint-disable-next-line no-undef */
  let globalMarked: Marked | undefined = globalThis?.marked as Marked;
  let loading: boolean = globalMarked === undefined;

  const onLoad = () => {
    loading = false;

    /* eslint-disable-next-line no-undef */
    globalMarked = globalThis?.marked as Marked;
  };
  const onError = () => {
    loading = false;
  };
</script>

{#if loading}
  <Spinner inline />
  <ScriptLoader
    url="/assets/assets/libs/marked.min.js"
    on:nnsLoad={onLoad}
    on:nnsError={onError}
  />
{:else if globalMarked !== undefined && text !== undefined}
  {@html globalMarked?.parse(removeHTMLTags(text) ?? "", {
    renderer: renderer(globalMarked),
  })}
{:else}
  <!-- fallback text content -->
  <p data-tid="markdown-text">{text}</p>
{/if}
