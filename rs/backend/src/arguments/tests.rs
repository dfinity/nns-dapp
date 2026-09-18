//! Tests for the validation and the escaping of canister arguments.
use super::{CanisterArguments, TemplateEngine};

/// Builds arguments from name and value pairs.
fn arguments(pairs: &[(&str, &str)]) -> CanisterArguments {
    CanisterArguments {
        args: CanisterArguments::args_from_str(pairs),
    }
}

/// The arguments that the deployment scripts create for the mainnet network.
///
/// The values come from `scripts/nns-dapp/test-config-assets/mainnet/arg.did`.
const MAINNET_ARGUMENTS: [(&str, &str); 8] = [
    ("API_HOST", "https://icp-api.io"),
    ("HOST", "https://icp-api.io"),
    ("ICP_SWAP_URL", "https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/"),
    ("IDENTITY_SERVICE_URL", "https://id.ai/"),
    ("ROBOTS", ""),
    ("SNS_AGGREGATOR_URL", "https://3r4gx-wqaaa-aaaaq-aaaia-cai.icp0.io"),
    ("STATIC_HOST", "https://icp0.io"),
    ("OWN_CANISTER_ID", "qoctq-giaaa-aaaaa-aaaea-cai"),
];

/// The arguments that the deployment scripts create for the app network.
///
/// The values come from `scripts/nns-dapp/test-config-assets/app/arg.did`.
const APP_ARGUMENTS: [(&str, &str); 8] = [
    ("API_HOST", "https://icp-api.io"),
    ("HOST", "https://icp-api.io"),
    ("ICP_SWAP_URL", "https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/"),
    ("IDENTITY_SERVICE_URL", "https://id.ai/"),
    ("ROBOTS", r#"<meta name="robots" content="noindex, nofollow" />"#),
    ("SNS_AGGREGATOR_URL", "https://otgyv-wyaaa-aaaak-qcgba-cai.icp0.io"),
    ("STATIC_HOST", "https://icp0.io"),
    ("OWN_CANISTER_ID", "xnjld-hqaaa-aaaal-qb56q-cai"),
];

/// The arguments that the deployment scripts create for a local network.
///
/// The values come from `scripts/nns-dapp/test-config-assets/local/arg.did`.
/// The local network has no `ICP_SWAP_URL`.
const LOCAL_ARGUMENTS: [(&str, &str); 7] = [
    ("API_HOST", "http://localhost:8080"),
    ("HOST", "http://localhost:8080"),
    (
        "IDENTITY_SERVICE_URL",
        "http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080",
    ),
    ("ROBOTS", r#"<meta name="robots" content="noindex, nofollow" />"#),
    ("SNS_AGGREGATOR_URL", "http://sns_aggregator.localhost:8080"),
    ("STATIC_HOST", "http://localhost:8080"),
    ("OWN_CANISTER_ID", "{OWN_CANISTER_ID}"),
];

#[test]
fn real_deployment_arguments_are_valid() {
    for (name, pairs) in [
        ("mainnet", &MAINNET_ARGUMENTS[..]),
        ("app", &APP_ARGUMENTS[..]),
        ("local", &LOCAL_ARGUMENTS[..]),
    ] {
        assert_eq!(arguments(pairs).validate(), Ok(()), "{name} arguments must be valid");
    }
}

#[test]
fn other_real_addresses_are_valid() {
    let valid = [
        "",
        "http://127.0.0.1:8080",
        "http://[::1]:8080",
        "https://identity.internetcomputer.org",
        "https://nns.ic0.app",
        "https://icp-api.io/api/v2",
        // A developer network address in `config.json`.
        "https://dev-ingress.devenv.dfinity.network",
    ];
    for value in valid {
        assert_eq!(
            arguments(&[("SNS_AGGREGATOR_URL", value)]).validate(),
            Ok(()),
            "{value:?} must be valid"
        );
    }
}

#[test]
fn hostile_url_arguments_are_rejected() {
    let hostile = [
        // Ends the attribute and the tag, then adds a script.
        r#"https://evil.com"><script src=https://evil.com/x.js></script>"#,
        // Ends the attribute only.
        r#"https://evil.com" data-x=""#,
        // Adds a source to the current directive.
        "https://icp-api.io https://evil.com",
        // Adds a directive to the policy.
        "https://icp-api.io; script-src *",
        // Adds a source with a comma.
        "https://icp-api.io,https://evil.com",
        // Adds a directive on a new line.
        "https://icp-api.io\nscript-src *",
        // Uses a scheme that runs code.
        "javascript:alert(1)",
        // Uses a wildcard instead of an address.
        "*",
        // Has no scheme.
        "//evil.com",
        // Has a backtick, which some parsers treat as a quote.
        "https://evil.com`",
    ];
    for value in hostile {
        for name in [
            "HOST",
            "API_HOST",
            "STATIC_HOST",
            "IDENTITY_SERVICE_URL",
            "ICP_SWAP_URL",
        ] {
            assert!(
                arguments(&[(name, value)]).validate().is_err(),
                "{name}={value:?} must be rejected"
            );
        }
    }
}

#[test]
fn hostile_robots_argument_is_rejected() {
    let hostile = [
        r#"<meta name="robots"><script>alert(1)</script>"#,
        "<script>alert(1)</script>",
        r#"<meta name="robots" content="noindex"><iframe src="https://evil.com"></iframe>"#,
        // Sends every visitor to another page.  A browser follows this redirect,
        // and the `Content-Security-Policy` of the page does not stop it.
        r#"<meta http-equiv="refresh" content="0;url=https://evil.com">"#,
        // Adds a second policy.  A browser intersects the two policies, so this
        // value breaks the application.
        r#"<meta http-equiv="Content-Security-Policy" content="default-src none">"#,
        // Adds an event handler attribute.
        "<meta name=x onload=alert(1)>",
        // Adds an attribute after the content attribute.
        r#"<meta name="robots" content="noindex" onload="alert(1)">"#,
        // Names another tag.
        r#"<link rel="stylesheet" href="https://evil.com/x.css">"#,
    ];
    for value in hostile {
        assert!(
            arguments(&[("ROBOTS", value)]).validate().is_err(),
            "ROBOTS={value:?} must be rejected"
        );
    }
}

#[test]
fn real_robots_arguments_are_valid() {
    // The two values that `config.sh` builds, plus the same tag without the
    // trailing slash.
    let valid = [
        "",
        r#"<meta name="robots" content="noindex, nofollow" />"#,
        r#"<meta name="robots" content="noindex, nofollow">"#,
    ];
    for value in valid {
        assert_eq!(
            arguments(&[("ROBOTS", value)]).validate(),
            Ok(()),
            "ROBOTS={value:?} must be valid"
        );
    }
}

#[test]
fn validation_names_the_bad_argument() {
    let error = arguments(&[("HOST", "https://icp-api.io; script-src *")])
        .validate()
        .expect_err("The value is not an address");
    assert!(error.contains("HOST"), "The error must name the argument: {error}");
}

#[test]
fn arguments_that_are_not_addresses_are_not_checked_as_addresses() {
    let pairs = [
        ("OWN_CANISTER_ID", "qoctq-giaaa-aaaaa-aaaea-cai"),
        ("DFX_NETWORK", "mainnet"),
        ("FETCH_ROOT_KEY", "false"),
        (
            "FEATURE_FLAGS",
            r#"{"ENABLE_ADDRESS_BOOK":true,"ENABLE_CKTESTBTC":false}"#,
        ),
        ("PLAUSIBLE_DOMAIN", "nns.ic0.app"),
        ("TVL_CANISTER_ID", ""),
    ];
    assert_eq!(arguments(&pairs).validate(), Ok(()));
}

#[test]
fn template_escapes_a_hostile_value() {
    let values = CanisterArguments::args_from_str(&[("HOST", r#"https://evil.com"><script>alert(1)</script>"#)]);
    let template_engine = TemplateEngine::new(&values[..]);
    let populated = template_engine.populate(r#"<meta content="connect-src ${{HOST}};">"#);
    assert_eq!(
        populated,
        r#"<meta content="connect-src https://evil.com&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;;">"#
    );
    assert!(!populated.contains("<script>"), "The value must not become a tag");
}

#[test]
fn template_keeps_real_addresses_unchanged() {
    for pairs in [&MAINNET_ARGUMENTS[..], &APP_ARGUMENTS[..], &LOCAL_ARGUMENTS[..]] {
        let values = CanisterArguments::args_from_str(pairs);
        let template_engine = TemplateEngine::new(&values[..]);
        for (name, value) in pairs {
            if *name == "ROBOTS" {
                continue;
            }
            assert_eq!(
                template_engine.populate(&format!("${{{{{name}}}}}")),
                *value,
                "{name} must be unchanged"
            );
        }
    }
}

#[test]
fn template_keeps_robots_as_html() {
    let robots = r#"<meta name="robots" content="noindex, nofollow" />"#;
    let values = CanisterArguments::args_from_str(&[("ROBOTS", robots)]);
    let template_engine = TemplateEngine::new(&values[..]);
    assert_eq!(template_engine.populate("<!-- ROBOTS -->"), robots);
}
