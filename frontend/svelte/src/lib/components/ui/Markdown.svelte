<script lang="ts">
  import ScriptLoader from "../common/ScriptLoader.svelte";
  import Spinner from "./Spinner.svelte";
  import { removeHTMLTags } from "../../utils/security.utils";

  export let text: string | undefined;

  // do not load the lib if available
  /* eslint-disable-next-line no-undef */
  let parse: (value: string) => string | undefined = globalThis?.marked?.parse;
  let loading: boolean = parse === undefined;

  const onLoad = () => {
    loading = false;
    /* eslint-disable-next-line no-undef */
    parse = globalThis?.marked?.parse;
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
{:else if parse !== undefined && text !== undefined}
  {@html parse(removeHTMLTags(text))}
{:else}
  <!-- fallback text content -->
  <p data-tid="markdown-text">{text}</p>
{/if}
