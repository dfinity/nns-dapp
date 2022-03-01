<script lang="ts">
    import Modal from "./Modal.svelte";
    import type {ProposalInfo} from '@dfinity/nns';
    import {NeuronId} from '@dfinity/nns';
    import {i18n} from "../stores/i18n";
    import Card from "../components/ui/Card.svelte";

    export let proposalInfo: ProposalInfo;

    let proposer: NeuronId | undefined;
    let visible: boolean = false;

    $: ({ proposer } = proposalInfo);
</script>

<button class="text" on:click|stopPropagation={() => visible = true}><small>Proposer: {proposer || ""}</small></button>

<Modal {visible} on:nnsClose={() => visible = false} theme="dark">
    <span slot="title">{$i18n.neuron.title}</span>

    <!-- TODO: Both neuron details card and fetching neuron itself are implemented in L2-313 -->
    <!-- Above task needs to be solved first before being able to implement following TODOs -->

    <Card><h4>TODO: Neuron details</h4></Card>

    <Card><h4>TODO: Voting history</h4></Card>
</Modal>

<style lang="scss">
    button {
      padding: 0;
      margin: 0;
    }
</style>
