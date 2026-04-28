/**
 * Prism.js language definition for NetApp ONTAP 9.x CLI
 *
 * Usage (Docusaurus / prism-react-renderer):
 *   import defineOntapCli from 'prism-ontap-cli';
 *   defineOntapCli(Prism);
 *
 * Usage (plain Node.js / Vite):
 *   import Prism from 'prismjs';
 *   import defineOntapCli from 'prism-ontap-cli';
 *   defineOntapCli(Prism);
 *
 * Then use the language identifier "ontap-cli" in code blocks.
 */
export default function defineOntapCli(Prism) {
  Prism.languages['ontap-cli'] = {

    // ── Output: "N entries were displayed." ─────────────────────────────
    // Must come before ontap-output-header to avoid false-positive matches.
    'ontap-output-count': {
      pattern: /^\d+(?:,\d+)* entr(?:y|ies) (?:were|was) displayed\.[ \t]*$/im,
    },

    // ── Output: column header line ───────────────────────────────────────
    // Matches the line immediately BEFORE a separator line (dashes).
    // IMPORTANT: listed before ontap-output-separator so the separator text
    // is still available in the raw string for the lookahead to inspect.
    //
    // Negative lookahead (?!\w[\w.-]*::) excludes prompt lines.
    'ontap-output-header': {
      pattern: /^(?!\w[\w.-]*::)[^\n]+(?=\n[\t ]*-{2,}(?:[\t ]+-{2,})*[\t ]*(?:\n|$))/m,
    },

    // ── Output: separator line of dashes ─────────────────────────────────
    // e.g. "------  -------  --------" or "---  ---  ---"
    'ontap-output-separator': {
      pattern: /^[\t ]*-{2,}(?:[\t ]+-{2,})*[\t ]*$/m,
    },

    // ── Command line: prompt + command name + parameters ─────────────────
    // Matches the entire line starting with an ONTAP prompt.
    // Examples:
    //   cluster1::> volume show
    //   cluster1::*> set advanced
    //   vs1::> vserver show
    'ontap-command-line': {
      pattern: /^\w[\w.-]*::[^>\n]*>[^\n]*/m,
      inside: {

        // Elevated prompt (contains *) — e.g. cluster1::*>
        // Matched before the standard prompt so the bold-white style takes priority.
        'ontap-prompt-elevated': /^\w[\w.-]*::\*[^>]*>/,

        // Standard prompt — e.g. cluster1::> or vs1::>
        'ontap-prompt': /^\w[\w.-]*::[^>\n]*>/,

        // A "-parameter [value]" pair.
        //
        // Matched BEFORE the command name so that value words (e.g. "admin")
        // are consumed here and not mistaken for command name words.
        //
        // Handles:
        //   -role admin                   → param + single word
        //   -state Error|Success          → param + pipe-separated alternatives
        //   -fields vserver, volume, aggr  → param + comma-separated list
        //   -timestamp "Jul 10 ..."       → param + quoted string
        //   -detail                       → standalone flag (no value)
        'ontap-param-value': {
          pattern: /-[a-z][\w.-]*(?:\s+(?!-)(?:"[^"]*"|'[^']*'|\S+(?:\|\S+)*(?:,\s*\S+(?:\|\S+)*)*))?/i,
          inside: {

            // The flag itself, always at the start of the matched text.
            'ontap-param': /^-[a-z][\w.-]*/i,

            // Quoted strings (greedy so inner content is not re-tokenized).
            'ontap-string': {
              pattern: /"[^"]*"|'[^']*'/,
              greedy: true,
            },

            // Boolean / operational-state keywords.
            'ontap-boolean': /\b(?:true|false|yes|no|up|down|enabled|disabled|online|offline|pending|success|error|available|unavailable)\b/i,

            // IPv4 addresses, with optional CIDR prefix or wildcard last octet.
            // e.g. 10.60.250.79, 192.168.1.0/24, 10.60.*
            'ontap-ip': /\b(?:\d{1,3}\.){3}(?:\d{1,3}(?:\/\d{1,2})?|\*)\b/,

            // Storage sizes, e.g. 100GB, 2.5TB, 512MB
            'ontap-size': /\b\d+(?:\.\d+)?[ \t]*(?:KB|MB|GB|TB|PB)\b/i,

            // Plain numeric values.
            'ontap-number': /\b\d+(?:\.\d+)?\b/,

            // Catch-all for any remaining unquoted value text.
            'ontap-value': /\S+/,
          },
        },

        // Command name: the space-separated lowercase words after the prompt
        // and before the first -parameter flag.
        //
        // Uses Prism's lookbehind trick: the first capturing group (leading
        // whitespace) is discarded, so the token covers only the command words.
        //
        // This works because ontap-param-value is matched first, leaving only
        // the command name (and whitespace) in the remaining string segments.
        'ontap-command': {
          pattern: /^(\s*)[a-z]+(?:\s+[a-z]+)*/,
          lookbehind: true,
        },

      },
    },

  };
}
