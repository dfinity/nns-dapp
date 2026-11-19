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
  ><path
    clip-rule="evenodd"
    d="M4.316 6.38C5.758 5.272 7.763 4.374 10 4.374s4.242.898 5.684 2.004c.722.555 1.319 1.173 1.74 1.78.41.59.701 1.239.701 1.841 0 .602-.291 1.25-.7 1.84-.422.608-1.019 1.226-1.741 1.78-1.442 1.107-3.447 2.005-5.684 2.005s-4.242-.898-5.684-2.004c-.722-.555-1.319-1.173-1.74-1.78-.41-.59-.701-1.239-.701-1.841 0-.602.291-1.25.7-1.84.422-.608 1.019-1.226 1.741-1.78Z"
    stroke="currentColor"
    stroke-width="1.5"
  /><path
    clip-rule="evenodd"
    d="M6.875 10a3.125 3.125 0 1 1 6.25 0 3.125 3.125 0 0 1-6.25 0Z"
    stroke="currentColor"
    stroke-width="1.5"
  /></svg
>
