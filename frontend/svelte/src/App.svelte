<script lang="ts">
</script>

<main>
</main>

<svelte:head>
  {#if !process.env.ROLLUP_WATCH}
  <!-- This is just a default; need to examine the CSP carefully and lock down accordingly. -->
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'self'; child-src 'none';"
  >
  {/if}
</svelte:head>

<style>
  /* Common parameters used throughout the app */
  :root {
    --widget-border: 25px;
    --widget-border-radius: 25px;
    --widget-border-radius-small: 10px;
    --widget-grey: #282a2d;
    --text-grey: #aeb7b7;
    --background-grey: #383c3c;
    --button-blue: #005fb7;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: black;
  }

  main {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(var(--background-grey) 80%, black);
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
