<script lang="ts">
  import Auth from "./Auth.svelte";
  import ContentPage from "./ContentPage.svelte";

  // Identity, shared with all tabs:
  let signedIn;
  let principal;
</script>

<main>
  <Auth bind:signedIn bind:principal />
  {#if signedIn}
    {#if process.env.REDIRECT_TO_LEGACY}
      <!-- This must match the loading placeholder of the flutter app exactly, to make the transition seamless. -->
      <div class="initial-load">
        <span>Getting the NNS dapp ready for you…</span>
      </div>
    {:else}
      <ContentPage />
    {/if}
  {/if}
</main>

<svelte:head>
  {#if !process.env.ROLLUP_WATCH}
    <!-- This is just a default; need to examine the CSP carefully and lock down accordingly. -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; child-src 'none';"
    />
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
    --font-size-normal: 14px;
    --font-size-large: 32px;
    --font-size-xlarge: 40px;
    --font-family: Circular-Bold, Arial, sans-serif;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: black;
  }

  main {
    width: 100vw;
    height: 100vh;
    background-color: #333;
    color: #eee;
    overflow: hidden;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  .initial-load {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial;
    font-size: 14px;
  }
</style>
