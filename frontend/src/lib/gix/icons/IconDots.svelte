<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  fill="currentColor"
  height={size}
  stroke="none"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    clip-rule="evenodd"
    d="M11.5 4C11.5 4.82843 10.8284 5.5 10 5.5C9.17157 5.5 8.5 4.82843 8.5 4C8.5 3.17157 9.17157 2.5 10 2.5C10.8284 2.5 11.5 3.17157 11.5 4ZM11.5 10C11.5 10.8284 10.8284 11.5 10 11.5C9.17157 11.5 8.5 10.8284 8.5 10C8.5 9.17157 9.17157 8.5 10 8.5C10.8284 8.5 11.5 9.17157 11.5 10ZM10 17.5C10.8284 17.5 11.5 16.8284 11.5 16C11.5 15.1716 10.8284 14.5 10 14.5C9.17157 14.5 8.5 15.1716 8.5 16C8.5 16.8284 9.17157 17.5 10 17.5Z"
    fill-rule="evenodd"
  />
</svg>
