/**
 * Helpers that guard the values written into the Content-Security-Policy.
 *
 * The policy lives in the `content` attribute of a `<meta>` tag in every built
 * `index.html`. A value that contains `"` or `>` ends the attribute or the tag,
 * and the rest of the value becomes live HTML. A value that contains a space, a
 * `;` or a `,` adds sources or directives to the policy.
 *
 * Every value that the build inserts must therefore pass
 * `assertValidCspSourceUrl` and then `escapeHtmlAttributeValue`.
 *
 * The `${{NAME}}` placeholders are different. The nns-dapp canister replaces
 * them when it installs the assets. The canister makes the same two checks. See
 * `rs/backend/src/arguments.rs`.
 */

/**
 * Characters that must never appear in a CSP source.
 *
 * A space or a tab separates two sources. A `;` or a `,` separates two
 * directives. A quote, an angle bracket, a backtick or a backslash can end the
 * HTML attribute or the tag.
 */
const UNSAFE_CSP_SOURCE_CHARACTERS = /[\s;,'"<>`\\]/;

/** Schemes that a CSP source may use. */
const ALLOWED_PROTOCOLS = ["http:", "https:"];

/**
 * Checks that a value is an absolute http or https address.
 *
 * The build must stop when the check fails. The build must never drop the value
 * and emit a weaker policy, because a weaker policy helps an attacker.
 *
 * @param {string} name the name of the value, used in the error message
 * @param {unknown} value the value to check
 * @returns {string} the value, unchanged
 * @throws {Error} if the value is not an absolute http or https address
 */
export const assertValidCspSourceUrl = (name, value) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Cannot build the Content-Security-Policy: ${name} is not a non-empty string.`
    );
  }

  if (UNSAFE_CSP_SOURCE_CHARACTERS.test(value)) {
    throw new Error(
      `Cannot build the Content-Security-Policy: ${name} contains a character that a CSP source must not contain: ${JSON.stringify(
        value
      )}.`
    );
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `Cannot build the Content-Security-Policy: ${name} is not an absolute address: ${JSON.stringify(
        value
      )}.`
    );
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    throw new Error(
      `Cannot build the Content-Security-Policy: ${name} must use http or https: ${JSON.stringify(
        value
      )}.`
    );
  }

  return value;
};

/**
 * Escapes a value for a double quoted HTML attribute.
 *
 * The escapes follow the OWASP recommendation. A browser decodes them before it
 * reads the policy, so a valid address still works.
 *
 * @param {string} value the value to escape
 * @returns {string} the escaped value
 */
export const escapeHtmlAttributeValue = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");

/**
 * Checks a value and escapes it for the CSP meta tag.
 *
 * @param {string} name the name of the value, used in the error message
 * @param {unknown} value the value to check and escape
 * @returns {string} the checked and escaped value
 * @throws {Error} if the value is not an absolute http or https address
 */
export const cspSourceFromUrl = (name, value) =>
  escapeHtmlAttributeValue(assertValidCspSourceUrl(name, value));
