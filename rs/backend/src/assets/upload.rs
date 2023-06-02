use ic_cdk::export::Principal;

/// Determine whether a given caller may upload the given tarball.
///
/// - A controller may upload an asset.
/// - TODO: A set whitelisted user may upload a whitelisted tarball.
///   Note: this is done but will be in another PR.
pub fn may_upload(caller: &Principal, is_controller: bool) -> Result<(), String> {
    let mut reason = "Permission denied:  ".to_string();
    if is_controller {
        return Ok(());
    }
    reason = format!("{reason}  Caller '{}' is not a controller.", caller);
    Err(reason)
}

/// Checks that a given text contains a given substring.
///
/// # Panics
/// - If the text coes not contain the expected substring.
#[cfg(test)]
fn assert_contains(text: &str, expected: &str, description: &str) {
    if !(text.contains(expected)) {
        panic!("{} '{}' should contain '{}'", description, text, expected)
    }
}

#[test]
fn controller_should_be_permitted_to_upload() {
    let caller = Principal::from_text("qsgjb-riaaa-aaaaa-aaaga-cai").unwrap();
    let is_controller = true;
    assert!(
        may_upload(&caller, is_controller).is_ok(),
        "Controller should be allowed to upload"
    );
}
#[test]
fn unauthorized_principal_should_not_be_able_to_upload_a_non_whitelisted_asset() {
    let whitelist = toy_whitelist();
    let caller = Principal::from_text("qsgjb-riaaa-aaaaa-aaaga-cai").unwrap();
    let is_controller = false;
    let response = may_upload(&caller, is_controller, &hash).expect_err("Permission should have been denied.");
    assert_contains(
        &response,
        &format!("Caller '{caller}' is not a controller."),
        "The rejection message",
    );
    assert_contains(
        &response,
        &format!("Caller '{caller}' is not whitelisted to update assets."),
        "The rejection message",
    );
}
