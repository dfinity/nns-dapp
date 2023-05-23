//! Tests for the argument parsing code.
use anyhow::{Context, Result};
use candid::parser::types::{IDLType, PrimType, IDLTypes};
use candid::IDLProg;
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
    json: Result<&'static str, &'static str>,
}

/// The arg parsing behaviour we would like.
const TEST_VECTORS: [TestVector; 9] = [
    TestVector {
        name: "No argument",
        did: "service : () -> {}",
        args: "()",
        json: Ok("[]"),
    },
    TestVector {
        name: "Optional argument omitted",
        did: "service : (opt nat8) -> {}",
        args: "()",
        json: Ok("[null]"),
    },
    TestVector {
        name: "Optional argument given as none",
        did: "service : (opt nat8) -> {}",
        args: "(none)",
        json: Ok("[null]"),
    },
    TestVector {
        name: "Optional argument provided",
        did: "service : (opt nat8) -> {}",
        args: "(opt 9)",
        json: Ok("[9]"),
    },
    TestVector {
        name: "Wrong argument type provided",
        did: "service : (opt nat8) -> {}",
        args: "(9)",
        json: Ok("[9]"),
    },
    TestVector {
        name: "Too many arguments provided",
        did: "service : (opt nat8) -> {}",
        args: "(opt 9, 11)",
        json: Ok("[9, 11]"),
    },
    TestVector {
        name: "Argument with multiple values",
        did: "service : (opt nat8, nat16) -> {}",
        args: "(opt 8, 10)",
        json: Ok("[8, 10]"),
    },
    TestVector {
        name: "Argument with multiple values v2",
        did: "service : (opt nat8, nat16) -> {}",
        args: "(none, 10)",
        json: Ok("[null, 10]"),
    },
    TestVector {
        name: "Argument with multiple values v3",
        did: "service : (opt opt nat8, nat16) -> {}",
        args: "(opt none, 10)",
        json: Ok("[null, 10]"),
    },
    // TODO: Names in types are supported
    // TODO: Decide how to handle the case when the type and data don't match
    // TODO: Handle args that are not valid candid
    // TODO: Decide what we want to show when the type itself is invalid
];

fn arg_types_from_did(did: &str) -> anyhow::Result<IDLTypes> {
    let prog = IDLProg::from_str(&did).context("Failed to parse canister did file.")?;
    let service = prog.actor.context("Could not find service in did file.")?;
    if let IDLType::ClassT(args, _) = service {
        Ok(IDLTypes{args})
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

/*
#[test]
fn args_should_be_parsed() {
    for TestVector { name, did, arg, json } in TEST_VECTORS {
        let did: IDLType = IDLType::from_str(did);
        let args: IDLArgs = IDLArgs::from_str(args);
        let expected = json;
        let actual = decode_args(args, did); // Note: This does NOT match the current code.
        assert_eq!(expected, actual, "Invalid conversion for test vector: {name}");
    }
}
*/