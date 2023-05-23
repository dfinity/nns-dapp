//! Tests for the argument parsing code.
use anyhow::{Context};
use candid::parser::types::{IDLType, IDLTypes};
use fn_error_context::context;
use crate::proposals::decode_arg;
use candid::{IDLProg, IDLArgs};
use std::str::FromStr;

/// Sample argument and expected corresponding output.
struct TestVector {
    /// Name of the test vector
    name: &'static str,
    /// Canister init arg type
    ///
    /// Note: May be provided internally, but may then be wrong if the schema changes.
    ///
    /// Note: May be provided by the proposer in future, if we use the .did included in the wasm metadata.
    did: &'static str,
    /// Canister init arg.
    ///
    /// Provided by the proposer.  May be invalid.
    args: &'static str,
    /// JSON or error message
    ///
    /// Note: We may want to always return a str, or a str and a list of warnings.
    ///       E.g. if the arg does not match the schema, we might show the arg with a warning.
    #[allow(unused)]
    json: &'static str,
    /// The actual current response, not the one we desire.
    status_quo: &'static str,
}

/// The arg parsing behaviour we would like.
const TEST_VECTORS: [TestVector; 10] = [
    TestVector {
        name: "No argument",
        did: "service : () -> {}",
        args: "()",
        json: "[]",
        status_quo: "[]",
    },
    TestVector {
        name: "Optional argument omitted",
        did: "service : (opt nat8) -> {}",
        args: "()",
        json: "[null]",
        status_quo: "[]",
    },
    TestVector {
        name: "Optional argument given as none",
        did: "service : (opt nat8) -> {}",
        args: "(null)",
        json: "[null]",
        status_quo: "null",
    },
    TestVector {
        name: "Optional argument provided",
        did: "service : (opt nat8) -> {}",
        args: "(opt 9)",
        json: "[9]",
        status_quo: "[\"9\"]",
    },
    TestVector {
        name: "Wrong argument type provided",
        did: "service : (opt nat8) -> {}",
        args: "(9)",
        json: "[9]",
        status_quo: "\"9\"",
    },
    TestVector {
        name: "Too many arguments provided",
        did: "service : (opt nat8) -> {}",
        args: "(opt 9, 11)",
        json: "[9, 11]",
        status_quo: "[\"9\"]",
    },
    TestVector {
        name: "Argument with multiple values",
        did: "service : (opt nat8, nat16) -> {}",
        args: "(opt 8, 10)",
        json: "[8, 10]",
        status_quo: "[\"8\"]",
    },
    TestVector {
        name: "Argument with multiple values v2",
        did: "service : (opt nat8, nat16) -> {}",
        args: "(null, 10)",
        json: "[null, 10]",
        status_quo: "null",
    },
    TestVector {
        name: "Argument with multiple values v3",
        did: "service : (opt opt nat8, nat16) -> {}",
        args: "(opt null, 10)",
        json: "[null, 10]",
        status_quo: "[null]",
    },
    // TODO: Names in types are supported
    TestVector {
        name: "Argument with multiple values v3",
        did: "
        type Config = record {
            update_interval_ms : nat64;
            fast_interval_ms : nat64;
          };
          
        service : (opt Config) -> {}",
        args: "(opt record{update_interval_ms = 999; fast_interval_ms = 100;})",
        json: "[{\"update_interval_ms\": 999, \"fast_interval_ms\": 100}]",
        status_quo: "[{\"2_344_481_514\":\"999\",\"3_143_647_229\":\"100\"}]",
    },
    // TODO: Check serialization when arguments are provided with annotation.
    // TODO: Decide how to handle the case when the type and data don't match
    // TODO: Handle args that are not valid candid
    // TODO: Decide what we want to show when the type itself is invalid
];

/// Extract the args field from a did types file.
/// 
/// TODO: Move into idl2json
fn arg_types_from_did(did: &str) -> anyhow::Result<IDLTypes> {
    let prog = IDLProg::from_str(&did).context("Failed to parse canister did file.")?;
    let service = prog.actor.context("Could not find service in did file.")?;
    if let IDLType::ClassT(args, _) = service {
        Ok(IDLTypes { args })
    } else {
        anyhow::bail!("Could not get arg for service")
    }
}
#[test]
fn arg_types_from_did_should_be_correct() {
    let ok_test_vectors = vec![
        ("service : (opt opt nat8, nat16) -> {}", "(opt opt nat8, nat16)"),
        ("service : (opt opt nat8) -> {}", "(opt opt nat8)"),
    ];
    for (did, arg) in ok_test_vectors {
        let actual_arg = arg_types_from_did(did).expect("Failed to get arg");
        let expected_arg = IDLTypes::from_str(arg).expect("Test error: Failed to parse expected arg type.");
        // IDLArgs does not implement Eq, so this is used as a poor alternative:
        assert_eq!(format!("{expected_arg:?}"), format!("{actual_arg:?}"));
    }
}

#[test]
fn args_should_be_parsed() {
   for test_vector in TEST_VECTORS {
    arg_should_be_parsed(&test_vector).with_context(|| format!("Test vector '{}' failed", test_vector.name)).unwrap();
   }
}

#[context("Test vector '{}' failed", test_vector.name)]
fn arg_should_be_parsed(test_vector: &TestVector) -> anyhow::Result<()> {
    let TestVector { name, did, args, status_quo, .. } = *test_vector.clone();
        let did: IDLTypes = arg_types_from_did(did).context("Test error: Failed to get args from candid interface description.")?;
        let args_parsed: IDLArgs = IDLArgs::from_str(args).context("Test error: Failed to parse arg value")?;
        let args_bytes = args_parsed.to_bytes().context("Failed to convert args to bytes")?;
        let expected = status_quo;
        let actual = decode_arg(&args_bytes, did); // Note: This does NOT match the current code.
        assert_eq!(expected, actual, "Invalid conversion for test vector: {name}");
        Ok(())
}
