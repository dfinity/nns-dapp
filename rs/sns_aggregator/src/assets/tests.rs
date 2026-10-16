//! Tests for the aggregator assets
#![allow(clippy::panic)]
#![allow(clippy::expect_used)]
#![allow(clippy::unwrap_used)]

/// The home page, exactly as it is compiled into the canister.
const HOME_PAGE: &str = include_str!("../index.html");

/// The text of every tag in the given HTML, without the enclosing angle brackets.
///
/// For example `<link href="x" />` yields `link href="x" /`.
fn tag_bodies(html: &str) -> Vec<&str> {
    html.split('<')
        .skip(1)
        .filter_map(|chunk| chunk.split_once('>').map(|(body, _rest)| body))
        .collect()
}

/// True if the tag body is a tag with the given name, such as `script` or `link`.
fn has_tag_name(tag_body: &str, name: &str) -> bool {
    tag_body
        .strip_prefix(name)
        .is_some_and(|rest| rest.is_empty() || rest.starts_with('/') || rest.starts_with(char::is_whitespace))
}

/// Every external `<script>` and `<link>` on the home page must be pinned with a
/// Subresource Integrity hash and must come from a certified gateway.
///
/// The hashes themselves are verified by hand, because the test has no network.
#[test]
fn home_page_pins_every_external_script_and_stylesheet() {
    let mut pinned_tags = 0;
    for tag_body in tag_bodies(HOME_PAGE) {
        if !has_tag_name(tag_body, "script") && !has_tag_name(tag_body, "link") {
            continue;
        }
        if !tag_body.contains("src=\"https://") && !tag_body.contains("href=\"https://") {
            continue;
        }
        assert!(
            tag_body.contains("integrity=\"sha384-"),
            "External resource has no Subresource Integrity hash: <{tag_body}>"
        );
        assert!(
            tag_body.contains("crossorigin=\"anonymous\""),
            "External resource has no crossorigin=\"anonymous\", so the browser ignores its Subresource Integrity hash: <{tag_body}>"
        );
        assert!(
            !tag_body.contains(".raw."),
            "External resource is loaded from an uncertified raw gateway: <{tag_body}>"
        );
        pinned_tags += 1;
    }
    assert!(
        pinned_tags >= 2,
        "The scan found {pinned_tags} external resources on the home page but expected at least 2, so the scan is broken."
    );
}
