<script lang="ts">
  import Input from "../../components/ui/Input.svelte";
  import { i18n } from "../../stores/i18n";
  import Modal from "../Modal.svelte";

  let followeeAddress: string = "";
</script>

<Modal theme="dark" size="medium" on:nnsClose>
  <span slot="title">{$i18n.neurons.new_followee.title}</span>
  <main>
    <article>
      <h4>{$i18n.neurons.new_followee.options_title}</h4>
      <ul>
        <li>
          <p>Internet Computer Association</p>
          <button class="secondary small"
            >{$i18n.neurons.new_followee.follow}</button
          >
        </li>
        <li>
          <p>DFINITY Foundation</p>
          <button class="secondary small"
            >{$i18n.neurons.new_followee.follow}</button
          >
        </li>
      </ul>
    </article>
    <article>
      <h4>{$i18n.neurons.neuron_id}</h4>
      <form on:submit|preventDefault>
        <Input
          inputType="text"
          placeholderLabelKey="neurons.new_followee.address_placeholder"
          name="new-followee-address"
          bind:value={followeeAddress}
          theme="dark"
        />
        <button class="primary full-width"
          >{$i18n.neurons.new_followee.follow_neuron}</button
        >
      </form>
    </article>
  </main>
</Modal>

<style lang="scss">
  main {
    padding: calc(3 * var(--padding));

    --input-width: 100%;
    display: flex;
    flex-direction: column;
    gap: calc(2 * var(--padding));
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--padding);

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
