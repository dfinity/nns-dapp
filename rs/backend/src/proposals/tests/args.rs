//! Tests for the argument parsing code.

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
const test_vectors: [TestVector; 6] = [
    TestVector {
        name: "No argument",
        did: "service : () -> {}",
        args: "()",
        json: "[]",
    },
    TestVector {
        name: "Optional argument omitted",
        did: "service : (opt nat8) -> {}",
        args: "()",
        json: "[null]",
    },
    TestVector {
        name: "Optional argument given as none",
        did: "service : (opt nat8) -> {}",
        args: "(none)",
        json: "[null]",
    },
    TestVector {
        name: "Optional argument provided",
        did: "service : (opt nat8) -> {}",
        args: "(opt 9)",
        json: "[9]",
    },
    TestVector {
        name: "Wrong argument type provided",
        did: "service : (opt nat8) -> {}",
        args: "(9)",
        json: "[9]",
    },
    TestVector {
        name: "Too many arguments provided",
        did: "service : (opt nat8) -> {}",
        args: "(opt 9, 11)",
        json: "[9, 11]",
    },
    TestVector {
        name: "Argument with multiple values",
        did: "service : (opt nat8, nat16) -> {}",
        args: "(opt 8, 10)",
        json: "[8, 10]",
    },
    TestVector {
        name: "Argument with multiple values v2",
        did: "service : (opt nat8, nat16) -> {}",
        args: "(none, 10)",
        json: "[null, 10]",
    },
    TestVector {
        name: "Argument with multiple values v3",
        did: "service : (opt opt nat8, nat16) -> {}",
        args: "(opt none, 10)",
        json: "[null, 10]",
    },
    // TODO: Names in types are supported
    // TODO: Decide how to handle the case when the type and data don't match
    // TODO: Handle args that are not valid candid
    // TODO: Decide what we want to show when the type itself is invalid
];

#[test]
fn args_should_be_parsed() {
    for TestVector { name, did, arg, json } in test_vectors {
        let did: IDLType = IDLType::from_str(did);
        let args: IDLArgs = IDLArgs::from_str(args);
        let expected = json;
        let actual = decode_args(args, did); // Note: This does NOT match the current code.
        assert_eq!(expected, actual, "Invalid conversion for test vector: {name}");
    }
}
