//! Code for customizing a particular installation

#![warn(missing_docs)]
#![warn(clippy::missing_docs_in_private_items)]
#![deny(clippy::panic)]
#![deny(clippy::expect_used)]
#![deny(clippy::unwrap_used)]

use candid::{CandidType, Deserialize};
use core::cell::RefCell;
use regex::{Captures, Regex};
use serde::Serialize;
use std::collections::HashMap;

/// Tests for the validation and the escaping of arguments.
#[cfg(test)]
mod tests;

/// `init` and `post_upgrade` arguments
#[derive(Debug, Default, Eq, PartialEq, CandidType, Serialize, Deserialize)]
pub struct CanisterArguments {
    /// Values that are to be set in the web front end, by injecting them into JavaScript.
    pub args: Vec<(String, String)>,
}

/// The names of the arguments that must hold a web address.
///
/// The front end puts these values in the `Content-Security-Policy` of every
/// page.  It also uses them as the target of network requests.
const URL_ARGUMENT_NAMES: [&str; 6] = [
    "API_HOST",
    "HOST",
    "ICP_SWAP_URL",
    "IDENTITY_SERVICE_URL",
    "SNS_AGGREGATOR_URL",
    "STATIC_HOST",
];

/// The names of the arguments that hold a fragment of `HTML`.
///
/// The template engine inserts these values without escaping.  Every other
/// value is escaped.  See `TemplateEngine::populate`.
const HTML_ARGUMENT_NAMES: [&str; 1] = ["ROBOTS"];

/// The pattern of a valid value for an argument in `URL_ARGUMENT_NAMES`.
///
/// The value must be empty, or an absolute `http` or `https` address.  The
/// pattern excludes every character that would end an `HTML` attribute or add
/// a source or a directive to the `Content-Security-Policy`.
const URL_PATTERN: &str = r#"\A(https?://(\[[0-9A-Fa-f:.]+\]|[A-Za-z0-9._~%+-]+)(:[0-9]+)?(/[^\s"'<>`\\;,]*)?)?\z"#;

/// The pattern of a valid value for an argument in `HTML_ARGUMENT_NAMES`.
///
/// The value must be empty, or the `robots` `meta` tag that `config.sh` builds
/// (`config.sh:134` and `config.sh:137`).  The pattern accepts no other tag and
/// no other attribute.  A `meta` tag with `http-equiv` can redirect the page or
/// add a second `Content-Security-Policy`, so the pattern excludes it.
const HTML_PATTERN: &str = r#"\A(<meta name="robots" content="[a-z, ]*" ?/?>)?\z"#;

/// Compiles one of the fixed patterns above.
///
/// The patterns are constants.  Tests exercise them, so they cannot fail to
/// compile in production.
fn fixed_regex(pattern: &str) -> Regex {
    Regex::new(pattern).unwrap_or_else(|err| {
        unreachable!(
            "This is a fixed regex.  It is exercised in tests, so it cannot fail to parse in production.  Error: {:?}",
            err
        )
    })
}

thread_local! {
  /// Arguments provided at installation or upgrade.
  pub static CANISTER_ARGUMENTS: RefCell<CanisterArguments> = RefCell::new(CanisterArguments::default().with_own_canister_id());
}

impl CanisterArguments {
    /// HTML meta tag to be included in every `index.html`.
    ///
    /// Canister arguments are included in the meta tag as data attributes.  Thus:
    /// - Arguments are upper snake case with digits: `SAMPLE_ARG2`
    /// - In the tag, arguments are lower kebab case data attributes: `data-sample-arg2`
    /// - In JavaScript the tag can be read as camel case with:
    ///   `document.querySelector('meta[name="nns-dapp-vars"]').dataset.sampleArg2`
    ///
    /// In Rust, the substitution is as follows:
    /// ```
    /// use nns_dapp::arguments::CanisterArguments;
    /// // The canister receives arguments when it is created.  The arguments typically include ROBOTS and similar values:
    /// let mut args: Vec<(String, String)> = CanisterArguments::args_from_str(&[("ROBOTS", r#"<meta name="robots" content="noindex, nofollow" />"#)]);
    ///
    /// // The OWN_CANISTER_ID is normally populated from the environment; we will set it directly
    /// // for the purposes of this demonstration:
    /// args.push(("OWN_CANISTER_ID".to_string(), "aeiouy".to_string()));
    ///
    /// // We now have complete arguments:
    /// let args = CanisterArguments{args, ..CanisterArguments::default()};
    ///
    /// // The arguments are encoded as a meta tag like this:
    /// assert_eq!(args.to_html(), r#"<meta name="nns-dapp-vars"
    ///         data-robots="&lt;meta name=&quot;robots&quot; content=&quot;noindex, nofollow&quot; /&gt;"
    ///         data-own-canister-id="aeiouy">
    /// "#);
    ///
    /// // The meta tag is then inserted into HTML HEAD tags.
    /// ```
    #[must_use]
    pub fn to_html(&self) -> String {
        let mut ans = r#"<meta name="nns-dapp-vars""#.to_string();
        for (key, value) in &self.args {
            ans.push_str("\n        ");
            ans.push_str(&configname2attributename(key));
            ans.push_str("=\"");
            ans.push_str(&configvalue2attributevalue(value));
            ans.push('"');
        }
        ans.push_str(">\n");
        ans
    }

    /// Looks at the environment to get the canister ID and add it to the list of arguments.
    #[must_use]
    pub fn with_own_canister_id(mut self) -> Self {
        self.args
            .push(("OWN_CANISTER_ID".to_string(), ic_cdk::api::canister_self().to_string()));
        self
    }

    /// Utility to convert static strings to an `args` field.
    ///
    /// ```
    /// use nns_dapp::arguments::CanisterArguments;
    /// let args = CanisterArguments::args_from_str(&[("FOO", "bar"), ("BAT", "man")]);
    /// let canister_arguments = CanisterArguments{args, ..CanisterArguments::default()};
    /// ```
    #[allow(dead_code)]
    #[must_use]
    pub fn args_from_str(str_args: &[(&str, &str)]) -> Vec<(String, String)> {
        str_args
            .iter()
            .map(|(key, val)| ((*key).to_string(), (*val).to_string()))
            .collect()
    }

    /// Checks that the argument values are safe to put in a page.
    ///
    /// The canister puts argument values in `index.html` in two places:
    /// * `to_html` writes them as data attributes of a `meta` tag.
    /// * `TemplateEngine::populate` replaces `${{NAME}}` and `<!-- NAME -->`.
    ///
    /// The front end builds the `Content-Security-Policy` of the page from the
    /// arguments in `URL_ARGUMENT_NAMES`.  A space, a `;` or a `,` in such a
    /// value adds a source or a directive to the policy.  A `"` or a `>` ends
    /// the attribute or the tag.  The check rejects those characters.
    ///
    /// The arguments in `HTML_ARGUMENT_NAMES` hold a fragment of `HTML`.  The
    /// check limits them to the `robots` `meta` tag.
    ///
    /// # Errors
    /// Returns the name of the first bad argument and the reason.
    ///
    /// ```
    /// use nns_dapp::arguments::CanisterArguments;
    /// let good = CanisterArguments{args: CanisterArguments::args_from_str(&[("HOST", "https://icp-api.io")]), ..CanisterArguments::default()};
    /// assert_eq!(good.validate(), Ok(()));
    ///
    /// let bad = CanisterArguments{args: CanisterArguments::args_from_str(&[("HOST", "https://evil.com\"><script>alert(1)</script>")]), ..CanisterArguments::default()};
    /// assert!(bad.validate().is_err());
    /// ```
    pub fn validate(&self) -> Result<(), String> {
        let url_regex = fixed_regex(URL_PATTERN);
        let html_regex = fixed_regex(HTML_PATTERN);
        for (key, value) in &self.args {
            if URL_ARGUMENT_NAMES.contains(&key.as_str()) && !url_regex.is_match(value) {
                return Err(format!(
                    "The argument {key} must be empty or an absolute http or https address.  Got: {value:?}"
                ));
            }
            if HTML_ARGUMENT_NAMES.contains(&key.as_str()) && !html_regex.is_match(value) {
                return Err(format!(
                    "The argument {key} must be empty or a robots meta tag.  Got: {value:?}"
                ));
            }
        }
        Ok(())
    }
}

/// Converts an upper-snake-case configuration variable to a lower-kebab-case name prefixed with data-.
/// This, in turn, will appear in JavaScript & family as camel case.
///
/// ```
/// use nns_dapp::arguments::configname2attributename;
/// assert_eq!(configname2attributename("FOO"), "data-foo");
/// assert_eq!(configname2attributename("TERMINATOR_2"), "data-terminator-2");
/// ```
#[must_use]
pub fn configname2attributename(name: &str) -> String {
    "data-".to_owned() + &name.replace('_', "-").to_lowercase()
}

/// Escapes a configuration value per the OWASP recommendation: <https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding-for-html-contexts>
#[must_use]
pub fn configvalue2attributevalue(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}

/// Sets arguments to the default value, or the provided value if given.
///
/// The canister traps if an argument value is not safe to put in a page.  The
/// install or the upgrade then fails, and the state does not change.  The
/// canister must not drop a bad value, because a page would then get a weaker
/// `Content-Security-Policy`.
pub fn set_canister_arguments(canister_arguments: Option<CanisterArguments>) {
    let canister_arguments = canister_arguments.unwrap_or_default().with_own_canister_id();
    if let Err(reason) = canister_arguments.validate() {
        ic_cdk::api::trap(format!("Invalid canister arguments.  {reason}"));
    }
    CANISTER_ARGUMENTS.with(|args| {
        args.replace(canister_arguments);
    });
}

/// Replaces arguments in a template
pub struct TemplateEngine {
    /// Values to replace
    args: HashMap<String, String>,
    /// The regular expression used to identify strings to replace.
    regex: Regex,
}
impl TemplateEngine {
    /// Creates a templating engine from canister arguments
    ///
    /// * The keys must be upper snake case, i.e. consist of the characters `A-Z0-9_`.
    /// * Values are taken from the engine `args` map.
    ///
    /// # Examples
    /// ```
    /// use nns_dapp::arguments::{TemplateEngine, CanisterArguments};
    /// let values: Vec<(String, String)> = CanisterArguments::args_from_str(&[("FOO", "bar"), ("SUPERMAN", "Peter Parker"), ("SUPER-MAN", "Lex Luthor"), ("lowercase", "SKY HIGH")]);
    /// let template_engine = TemplateEngine::new(&values[..]);
    /// assert_eq!(template_engine.populate("${{FOO}}"), "bar");
    /// assert_eq!(template_engine.populate("<!--FOO-->"), "bar");
    /// assert_eq!(template_engine.populate("They say that <!--SUPERMAN--> is ${{SUPER-MAN}}"), "They say that Peter Parker is ${{SUPER-MAN}}", "Hyphens are not supported");
    /// assert_eq!(template_engine.populate("${{lowercase}}"), "${{lowercase}}", "Only uppercase, digits and underscore are valid");
    /// ```
    #[must_use]
    pub fn new(key_val_pairs: &[(String, String)]) -> Self {
        let args = key_val_pairs.iter().cloned().collect();
        // Please see .populate() to learn what this regex does.
        let regex = fixed_regex(r"\$\{\{([_0-9A-Z]+)\}\}|<!-- *([_0-9A-Z]+) *-->");
        TemplateEngine { args, regex }
    }

    /// Replaces substrings of the form `${{ARG_KEY}}` and `<!-- ARG_KEY -->` with the corresponding argument value.
    ///
    /// * The keys must be upper snake case, i.e. consist of the characters `A-Z0-9_`.
    /// * Values are taken from the engine `args` map.
    ///   * If no match is found in the `args` map, variables are left unchanged.
    /// * A value is escaped for an `HTML` attribute, unless the key is in
    ///   `HTML_ARGUMENT_NAMES`.
    ///
    /// The templates put values inside the `content` attribute of the
    /// `Content-Security-Policy` `meta` tag.  A browser decodes the escapes
    /// before it reads the policy, so a valid address still works.  The escape
    /// stops a value from ending the attribute or the tag.
    ///
    /// # Examples
    /// ```
    /// use nns_dapp::arguments::{TemplateEngine, CanisterArguments};
    /// let values: Vec<(String, String)> = CanisterArguments::args_from_str(&[("HOST", "https://icp-api.io"), ("EVIL", r#""><script>alert(1)</script>"#), ("ROBOTS", r#"<meta name="robots" content="noindex, nofollow" />"#)]);
    /// let template_engine = TemplateEngine::new(&values[..]);
    /// assert_eq!(template_engine.populate("${{HOST}}"), "https://icp-api.io", "A valid address is unchanged");
    /// assert_eq!(template_engine.populate("${{EVIL}}"), "&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;", "A hostile value is escaped");
    /// assert_eq!(template_engine.populate("<!-- ROBOTS -->"), r#"<meta name="robots" content="noindex, nofollow" />"#, "ROBOTS is HTML");
    /// ```
    #[must_use]
    pub fn populate(&self, input: &str) -> String {
        self.regex
            .replace_all(input, |cap: &Captures| {
                if let Some(key) = cap.get(1).or_else(|| cap.get(2)) {
                    let Some(val) = self.args.get(key.as_str()) else {
                        return cap.get(0).map(|x| x.as_str().to_string()).unwrap_or_default();
                    };
                    if HTML_ARGUMENT_NAMES.contains(&key.as_str()) {
                        val.clone()
                    } else {
                        configvalue2attributevalue(val)
                    }
                } else {
                    "REGEX ERROR".to_string()
                }
            })
            .to_string()
    }
}
