<!-- source: DFINITY foundation -->
<script lang="ts">
  interface Props {
    size?: string | number;
  }

  const DEFAULT_SIZE = 40;

  let { size = `${DEFAULT_SIZE}px` }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M17.5 7.60498V6.49744C17.5 4.2883 15.7091 2.49744 13.5 2.49744H6.5C4.29086 2.49744 2.5 4.2883 2.5 6.49744V13.4974C2.5 15.7066 4.29086 17.4974 6.5 17.4974H13.5C15.7091 17.4974 17.5 15.7066 17.5 13.4974V12.7125M17.5 7.60498H12.5538C11.1434 7.60498 10 8.74834 10 10.1588V10.1588C10 11.5692 11.1434 12.7125 12.5538 12.7125H17.5M17.5 7.60498V12.7125"
    stroke-width="1.5"
  />
  <path
    d="M12.554 10.157H12.559"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
  />
</svg>
