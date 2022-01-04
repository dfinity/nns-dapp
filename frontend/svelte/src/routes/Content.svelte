

<div class="content-page">
      <div class="header-bar">
        <h1 class="title">NETWORK NERVOUS SYSTEM</h1>
        <span class="logout" />
      </div>
      <div class="nav-bar">
        <div class="background" />
        <!--

        <button on:click={() => go([accountsPageName])}>{accountsPageName}</button>
        <button on:click={() => go([neuronsPageName])}>{neuronsPageName}</button>
        <button on:click={() => go([votingPageName])}>{votingPageName}</button>
        <button on:click={() => go([canistersPageName])}>{canistersPageName}</button>
        -->
      </div>

</div>


<style>
  .nav-bar {
    --top-margin: 10px;
    --side-margin: 20px;
    height: calc(100% - 2 * var(--top-margin));
    border-radius: 16px;
    background-color: var(--widget-grey);
    margin: var(--top-margin) var(--side-margin) var(--top-margin) var(--side-margin);
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
  .content-page {
    width: 100%;
    height: 100%;
    background-color: black;
    display: grid;
    grid-template-rows: 76px 84px auto;
    overflow: clip;
  }
  .content-tabs {
    background-color: #333;
  }
</style>
