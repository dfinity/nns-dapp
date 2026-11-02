use super::*;
use candid_parser::utils::{service_equal, CandidSource};

#[test]
fn test_implemented_interface_matches_declared_interface_exactly() {
    let declared_interface_path = "nns-dapp.did";
    let declared_interface = std::fs::read(&declared_interface_path).unwrap();
    let declared_interface = String::from_utf8(declared_interface).unwrap();
    let declared_interface = CandidSource::Text(&declared_interface);

    // The line below generates did types and service definition from the
    // methods annotated with `candid_method` main.rs. The definition is then
    // obtained with `__export_service()`.
    candid::export_service!();
    let implemented_interface_str = __export_service();
    let implemented_interface = CandidSource::Text(&implemented_interface_str);

    let result = service_equal(implemented_interface, declared_interface);
    assert!(result.is_ok(), "Error: {:?}", result);
}

#[test]
fn api_doc_names_every_declared_method() {
    let declared_interface = std::fs::read_to_string("nns-dapp.did").unwrap();
    let (env, actor) = CandidSource::Text(&declared_interface).load().unwrap();
    let actor = actor.expect("nns-dapp.did declares no service");
    for (method, _) in env.as_service(&actor).unwrap() {
        assert!(
            API_DOC.contains(&format!("`{method}`")),
            "api_doc.md does not name the method `{method}`."
        );
    }
}
