<!-- source: DFINITY foundation -->
<script lang="ts">
  interface Props {
    size?: string | number;
  }

  // Default to 100% size to make sure Safari renders the SVG correctly
  let { size = "100%" }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  viewBox="0 0 144 144"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    fill="#436FF5"
    height="102.264"
    opacity=".2"
    rx="18.06"
    transform="rotate(7 -89.042 288.23)"
    width="102.264"
  /><path
    d="M40.043 27.767c-11.68 1.49-19.74 12.752-18.396 24.86C22.994 64.76 33.343 73.73 45.062 72.233c11.679-1.49 19.74-12.752 18.395-24.86C62.11 35.24 51.761 26.27 40.043 27.767Z"
    fill="url(#paint0_linear_748_151)"
    stroke="url(#paint1_linear_748_151)"
    stroke-width="5"
  /><path
    d="M61 82H27C15 82 9 89 9 99v17c0 12 17 18 35 18s33-6.5 33-18V99c0-10-6-17-16-17Z"
    fill="url(#paint2_linear_748_151)"
  /><defs
    ><linearGradient
      id="paint0_linear_748_151"
      gradientUnits="userSpaceOnUse"
      x1="24"
      x2="68.813"
      y1="13.804"
      y2="25.046"
      ><stop stop-color="#C4D3FF" /><stop
        offset="1"
        stop-color="#003FFF"
      /></linearGradient
    ><linearGradient
      id="paint1_linear_748_151"
      gradientUnits="userSpaceOnUse"
      x1="8.982"
      x2="74.099"
      y1="9.737"
      y2="75.778"
      ><stop stop-color="#AFC3FF" stop-opacity="0" /><stop
        offset="1"
        stop-color="#1851FF"
      /></linearGradient
    ><linearGradient
      id="paint2_linear_748_151"
      gradientUnits="userSpaceOnUse"
      x1="9"
      x2="73.5"
      y1="78"
      y2="140"
      ><stop stop-color="#C4D3FF" /><stop
        offset="1"
        stop-color="#003FFF"
      /></linearGradient
    ></defs
  ></svg
>
