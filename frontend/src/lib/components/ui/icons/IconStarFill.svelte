<!-- source: DFINITY foundation -->
<script lang="ts">
  // TODO(launchpad2): Replace with the IconStarFill from the gix-components library
  import { DEFAULT_ICON_SIZE } from "@dfinity/gix-components";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  height={size}
  width={size}
  viewBox="0 0 24 24"
  fill="currentColor"
  stroke="currentColor"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M11.938 3.5L14.6998 9.09516L20.8759 9.9979L16.4069 14.3507L17.4616 20.5L11.938 17.5952L6.4143 20.5L7.46898 14.3507L3 9.9979L9.17613 9.09516L11.938 3.5Z"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
