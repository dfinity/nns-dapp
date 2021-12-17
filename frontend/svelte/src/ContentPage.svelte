<script lang="ts">
  import { onMount } from "svelte";
  import AccountsPage, { NAME as accountsPageName } from "./AccountsPage.svelte";
  import CanistersPage, { NAME as canistersPageName } from "./CanistersPage.svelte";
  import NeuronsPage, { NAME as neuronsPageName } from "./NeuronsPage.svelte";
  import VotingPage, { NAME as votingPageName } from "./VotingPage.svelte";

  // Navigation
  /* The current deep link path */
  let deepLink = [];
  /* Set the window hash from the deep link path  */
  let setLocationHash = () => window.location.hash = `#/${deepLink.join("/")}`;
  /* Get the deep link path from the location hash */
  let getLocationHash = () => deepLink = window.location.hash.slice(2).split("/").filter(x => x!=="");
  /* Navigate to a path */
  let go = (path: Array<String>) => {
    console.log({path});
    if (path.length === 0) {
      path = [accountsPageName];
    }
    deepLink = path;
    setLocationHash();

    // Cross link to flutter
    if (process.env.REDIRECT_TO_LEGACY && (deepLink[0] !== accountsPageName)) {
      let newLocation = `/`;
      if (window.location.path === newLocation) {
        console.warn("Refusing to redirect to self");
      } else {
        window.location.assign(`${newLocation}${window.location.hash}`);
      }
    }    
  }

  onMount(() => {
    getLocationHash();
    go(deepLink);
  });
</script>


      <div class="header-bar">
        <h1 class="title">NETWORK NERVOUS SYSTEM</h1>
        <span class="logout" />
      </div>
      <div class="nav-bar">
        <div class="background" />
        <button on:click={() => go([accountsPageName])}>{accountsPageName}</button>
        <button on:click={() => go([neuronsPageName])}>{neuronsPageName}</button>
        <button on:click={() => go([votingPageName])}>{votingPageName}</button>
        <button on:click={() => go([canistersPageName])}>{canistersPageName}</button>
      </div>
      <div class="content">
        {#if deepLink[0] === accountsPageName}
          <div id="AccountsPage"><AccountsPage /></div>
        {/if}
      </div>


<style>
  .nav-bar {
    height: 70px;
    border-radius: var(--widget-border-radius);
    background-color: var(--widget-grey);
    margin: 10px;
    display: flex;
    justify-content: space-around;
    position: relative;
  }
  .nav-bar > * {
    margin-top: auto;
    margin-bottom: auto;
    z-index: 1;
  }
  .nav-bar > .background {
    height: 100%;
    width: 25%; /* 100/4 elements */
    background-color: var(--button-blue);
    border-radius: var(--widget-border-radius-small);
    position: absolute;
    left: 0;
    z-index: 0;
  }
  .nav-bar > button {
    background-color: transparent;
    color: var(--text-grey);
    border: none;
  }

  .header-bar {
      --header-bar-height: 76px;
      background-image: url(/assets/assets/gradient.jpg);
      background-size: cover;
      background-repeat: no-repeat;
/*
      The image is just a gradient, however the exact parameters are unknown at this stage and even slight changes are very noticeable.
        background-image: linear-gradient(
      80deg,
      #f9a739,
      #ee3e4b,
      #502d89,
      #2b8ae0
    );
*/
    height: var(--header-bar-height);
    width: 100%;
  }
  .header-bar h1 {
    text-align: center;
    line-height: var(--header-bar-height);
    font-size: calc(18cm / 38); /* TODO: Flutter uses 24/18/12 depending on screen size. */
    font-weight: 500;
    letter-spacing: 2.4px;
    margin: 0;
  }
</style>
