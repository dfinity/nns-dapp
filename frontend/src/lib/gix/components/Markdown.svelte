<script lang="ts">
  import Html from "$lib/gix/components/Html.svelte";
  import Spinner from "$lib/gix/components/Spinner.svelte";
  import { markdownToHTML } from "$lib/gix/utils/markdown.utils";

  interface Props {
    text: string | undefined;
  }

  let { text }: Props = $props();

  let html = $state<string | undefined>();
  let error = $state(false);
  const transform = async (text: string) => {
    try {
      html = await markdownToHTML(text);
    } catch (err) {
      console.error(err);
      error = true;
    }
  };
  $effect(() => {
    if (text !== undefined) {
      transform(text).then();
    }
  });
</script>

{#if error}
  <p data-tid="markdown-text">{text}</p>
{:else if html === undefined}
  <Spinner inline />
{:else}
  <Html text={html} />
{/if}
