<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconGitHub } from "@dfinity/gix-components";
  function colorToRgb(color: string): string {
    // Create a temporary element to use for color conversion
    const temp = document.createElement("div");
    temp.style.color = color;
    document.body.appendChild(temp);

    // Get the computed style
    const style = window.getComputedStyle(temp);
    const rgb = style.color;

    // Remove the temporary element
    document.body.removeChild(temp);

    // Extract RGB values
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      return `${match[1]}, ${match[2]}, ${match[3]}`;
    }

    // Return a default value if conversion fails
    return "0, 0, 0";
  }
</script>

<a
  data-tid="source-code-link"
  href="https://github.com/dfinity/nns-dapp"
  rel="noopener noreferrer external"
  target="_blank"
  class="source-code-button"
  style="--light-background: rgb({colorToRgb('var(--cp-light-50)')})"
>
  <IconGitHub />
  {$i18n.navigation.source_code}
</a>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .source-code-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--padding-0_5x);
    padding: var(--padding-1_5x);
    border-radius: var(--border-radius);
    color: var(--text-color);
    font-size: var(--font-size-small);
    text-decoration: none;

    background: rgb(255, 255, 255, 0.45);
    &:hover {
      background: var(--cp-light-50);
    }
  }

  @include media.dark-theme {
    .source-code-button {
      background: rgb(0, 0, 0, 0.2);
      &:hover {
        background: var(--cp-dark-900);
      }
    }
  }
</style>
