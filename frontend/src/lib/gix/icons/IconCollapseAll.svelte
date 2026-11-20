<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="m 15.330508,2.9364407 c -1.75,1.75 -3.5,3.5 -5.25,5.25 -1.7499998,-1.75 -3.4999997,-3.5 -5.2499995,-5.25"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="m 4.7838983,16.898274 c 1.7499999,-1.75 3.4999998,-3.5 5.2499997,-5.25 1.75,1.75 3.500001,3.5 5.250001,5.25"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
