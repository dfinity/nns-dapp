<script lang="ts">
  import Logout from "./Logout.svelte";
  import { i18n } from "../../stores/i18n";
  import GetICPs from "../ic/GetICPs.svelte";

  const deployEnv: string = process.env.DEPLOY_ENV;
</script>

<header>
  <img
    loading="lazy"
    role="presentation"
    alt=""
    src="/assets/assets/gradient.jpg"
  />

  {#if deployEnv === "testnet"}
    <GetICPs />
  {/if}

  <h4>{$i18n.header.title}</h4>
  <Logout />
</header>

<style lang="scss">
  @use "../../themes/mixins/img";

  header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

    height: var(--header-height);
    overflow: hidden;

    display: grid;
    grid-template-columns: 25% 50% 25%;

    justify-content: center;
    align-items: center;
  }

  img {
    @include img.background;
  }

  h4 {
    margin: 0;

    color: white;
    letter-spacing: 1.4px;

    grid-column-start: 2;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    text-align: center;

    z-index: var(--z-index);

    line-height: inherit;
  }
</style>
