<script lang="ts">
  type RadioOption = {
    value: string;
    label: string;
    title?: string;
  };

  type Props = {
    options: RadioOption[];
    value?: string;
    name?: string;
    ariaLabel?: string;
  };

  let { options, value = $bindable(), name, ariaLabel }: Props = $props();

  const handleChange = (newValue: string) => (value = newValue);
</script>

<div class="options" role="radiogroup" aria-label={ariaLabel}>
  {#each options as option}
    <label class="radio-option">
      <input
        type="radio"
        {name}
        value={option.value}
        checked={value === option.value}
        aria-checked={value === option.value}
        title={option.title}
        onchange={() => handleChange(option.value)}
      />
      <span class="label">{option.label}</span>
    </label>
  {/each}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .options {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);

    @include media.min-width(medium) {
      flex-direction: row;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: var(--padding);
      cursor: pointer;

      .label {
        color: var(--text-description);
        font-size: var(--font-size-body);
      }

      input[type="radio"] {
        appearance: none;
        width: 18px;
        height: 18px;
        border: 2px solid var(--primary);
        border-radius: 50%;
        margin: 0;
        cursor: pointer;
        position: relative;
        background: transparent;

        &:checked {
          border: 5px solid var(--primary, #666);
        }
      }
    }
  }
</style>
