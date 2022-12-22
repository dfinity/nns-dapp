<script lang="ts">
  import { isNullish } from "$lib/utils/utils";
  import { fromNullable } from "@dfinity/utils";
  import type { CanisterMeta } from "$lib/services/demoapps.services";
  import type { Meta } from "$lib/canisters/demoapps/demoapps.did";
  import type { Principal } from "@dfinity/principal";

  export let canisterMeta: CanisterMeta;

  let meta: Meta;
  let canisterId: Principal;

  $: ({ meta, canisterId } = canisterMeta);

  let url: [] | [string];
  let theme: string;
  let logo: string;
  let name: string;
  let description: [] | [string];

  $: ({ url, theme, logo, name, description } = meta);

  // window.location.host

  const mapWindowUrl = (): string => {
    const { location } = window;
    const parts = location.host.split(".");
    return `${location.protocol}//${canisterId.toText()}.${parts.slice(1).join(".")}/`;
  };

  let validUrl: string;
  $: validUrl = isNullish(fromNullable(url))
    ? mapWindowUrl()
    : (fromNullable(url) as string);
</script>

<a href={`${validUrl}`} rel="external noopener noreferrer" target="_blank">
  <article>
    <div style="background: {theme}">
      <img
        alt=""
        aria-hidden="true"
        loading="lazy"
        role="presentation"
        src={logo}
      />
    </div>

    <p>{name}</p>
  </article>
</a>

<style lang="scss">
  a {
    color: inherit;
    text-decoration: inherit;

    &:hover,
    &:active {
      color: inherit;
      text-decoration: inherit;
    }

    transition: transform 0.25s ease-out;

    img {
      transition: transform 0.5s ease-out;
    }

    &:focus,
    &:hover {
      img {
        transform: scale(1.2);
      }
    }
  }

  article {
    width: 100%;
    height: 100%;

    position: relative;

    &:focus-visible {
      outline: none;
    }
  }

  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 11rem;

    margin-bottom: 1em;
    border-radius: var(--border-radius);

    img {
      width: 6rem;
      height: 6rem;
    }
  }

  p {
    text-align: center;
  }
</style>
