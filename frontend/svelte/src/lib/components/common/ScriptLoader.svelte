<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  export let url: string | undefined;

  const dispatch = createEventDispatcher();
  let script: HTMLScriptElement;

  onMount(async () => {
    script.addEventListener("load", () => dispatch("nnsLoad"));

    script.addEventListener("error", (event) => {
      console.error("script load error", event);
      dispatch("nnsError");
    });
  });
</script>

<svelte:head>
  <script bind:this={script} src={url}></script>
</svelte:head>
