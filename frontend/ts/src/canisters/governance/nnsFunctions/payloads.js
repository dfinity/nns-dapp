const SubnetFeatures = IDL.Rec();
const SubnetType = IDL.Rec();
const AddNodeOperatorPayload = IDL.Record({
    'node_operator_principal_id' : IDL.Opt(IDL.Principal),
    'node_allowance' : IDL.Nat64,
    'node_provider_principal_id' : IDL.Opt(IDL.Principal),
});
const AddNodesToSubnetPayload = IDL.Record({
    'subnet_id' : IDL.Principal,
    'node_ids' : IDL.Vec(IDL.Principal),
});
const BlessReplicaVersionPayload = IDL.Record({
    'node_manager_sha256_hex' : IDL.Text,
    'release_package_url' : IDL.Text,
    'sha256_hex' : IDL.Text,
    'replica_version_id' : IDL.Text,
    'release_package_sha256_hex' : IDL.Text,
    'node_manager_binary_url' : IDL.Text,
    'binary_url' : IDL.Text,
});
const CreateSubnetPayload = IDL.Record({
    'unit_delay_millis' : IDL.Nat64,
    'max_instructions_per_round' : IDL.Nat64,
    'features' : SubnetFeatures,
    'max_instructions_per_message' : IDL.Nat64,
    'gossip_registry_poll_period_ms' : IDL.Nat32,
    'max_ingress_bytes_per_message' : IDL.Nat64,
    'dkg_dealings_per_block' : IDL.Nat64,
    'max_block_payload_size' : IDL.Nat64,
    'max_instructions_per_install_code' : IDL.Nat64,
    'start_as_nns' : IDL.Bool,
    'is_halted' : IDL.Bool,
    'gossip_pfn_evaluation_period_ms' : IDL.Nat32,
    'max_ingress_messages_per_block' : IDL.Nat64,
    'gossip_max_artifact_streams_per_peer' : IDL.Nat32,
    'replica_version_id' : IDL.Text,
    'gossip_max_duplicity' : IDL.Nat32,
    'gossip_max_chunk_wait_ms' : IDL.Nat32,
    'dkg_interval_length' : IDL.Nat64,
    'subnet_id_override' : IDL.Opt(IDL.Principal),
    'ingress_bytes_per_block_soft_cap' : IDL.Nat64,
    'initial_notary_delay_millis' : IDL.Nat64,
    'gossip_max_chunk_size' : IDL.Nat32,
    'subnet_type' : SubnetType,
    'gossip_retransmission_request_ms' : IDL.Nat32,
    'gossip_receive_check_cache_size' : IDL.Nat32,
    'node_ids' : IDL.Vec(IDL.Principal),
});
const RecoverSubnetPayload = IDL.Record({
    'height' : IDL.Nat64,
    'replacement_nodes' : IDL.Opt(IDL.Vec(IDL.Principal)),
    'subnet_id' : IDL.Principal,
    'registry_store_uri' : IDL.Opt(IDL.Tuple(IDL.Text, IDL.Text, IDL.Nat64)),
    'state_hash' : IDL.Vec(IDL.Nat8),
    'time_ns' : IDL.Nat64,
});
const RemoveNodesFromSubnetPayload = IDL.Record({
    'node_ids' : IDL.Vec(IDL.Principal),
});
const SetFirewallConfigPayload = IDL.Record({
    'ipv4_prefixes' : IDL.Vec(IDL.Text),
    'firewall_config' : IDL.Text,
    'ipv6_prefixes' : IDL.Vec(IDL.Text),
});
SubnetFeatures.fill(IDL.Record({ 'ecdsa_signatures' : IDL.Bool }));
SubnetType.fill(
    IDL.Variant({
        'application' : IDL.Null,
        'verified_application' : IDL.Null,
        'system' : IDL.Null,
    })
);
const UpdateIcpXdrConversionRatePayload = IDL.Record({
    'data_source' : IDL.Text,
    'xdr_permyriad_per_icp' : IDL.Nat64,
    'timestamp_seconds' : IDL.Nat64,
});
const UpdateSubnetReplicaVersionPayload = IDL.Record({
    'subnet_id' : IDL.Principal,
    'replica_version_id' : IDL.Text,
});
