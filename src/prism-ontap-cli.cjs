/**
 * Prism.js language definition for NetApp ONTAP 9.x CLI (CommonJS edition)
 *
 * Usage (CommonJS / Docusaurus Root wrapper):
 *   const defineOntapCli = require('prism-ontap-cli');
 *   defineOntapCli(Prism);
 */
'use strict';

module.exports = function defineOntapCli(Prism) {
  Prism.languages['ontap-cli'] = {

    // ── Output: "N entries were displayed." ─────────────────────────────
    'ontap-output-count': {
      pattern: /^\d+(?:,\d+)* entr(?:y|ies) (?:were|was) displayed\.[ \t]*$/im,
    },

    // ── Output: column header line ───────────────────────────────────────
    // IMPORTANT: listed before ontap-output-separator so the lookahead can
    // still see the separator text in the raw string.
    'ontap-output-header': {
      pattern: /^(?!\w[\w.-]*::)[^\n]+(?=\n[\t ]*-{2,}(?:[\t ]+-{2,})*[\t ]*(?:\n|$))/m,
    },

    // ── Output: separator line of dashes ─────────────────────────────────
    'ontap-output-separator': {
      pattern: /^[\t ]*-{2,}(?:[\t ]+-{2,})*[\t ]*$/m,
    },

    // ── Command line: prompt + command name + parameters ─────────────────
    'ontap-command-line': {
      pattern: /^\w[\w.-]*::[^>\n]*>[^\n]*/m,
      inside: {

        // Elevated prompt (contains *) — e.g. cluster1::*>
        'ontap-prompt-elevated': /^\w[\w.-]*::\*[^>]*>/,

        // Standard prompt — e.g. cluster1::> or vs1::>
        'ontap-prompt': /^\w[\w.-]*::[^>\n]*>/,

        // A "-parameter [value]" pair — matched before command name.
        'ontap-param-value': {
          pattern: /-[a-z][\w.-]*(?:\s+(?!-)(?:"[^"]*"|'[^']*'|\S+(?:\|\S+)*(?:,\s*\S+(?:\|\S+)*)*))?/i,
          inside: {
            'ontap-param': /^-[a-z][\w.-]*/i,
            'ontap-string': {
              pattern: /"[^"]*"|'[^']*'/,
              greedy: true,
            },
            'ontap-boolean': /\b(?:true|false|yes|no|up|down|enabled|disabled|online|offline|pending|success|error|available|unavailable)\b/i,
            'ontap-wwpn': /\b(?:[0-9a-fA-F]{2}:){7}[0-9a-fA-F]{2}\b/,
            'ontap-mac': /\b(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}\b|\b(?:[0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}\b|\b(?:[0-9a-fA-F]{4}\.){2}[0-9a-fA-F]{4}\b/,
            'ontap-ip': /\b(?:\d{1,3}\.){3}(?:\d{1,3}(?:\/\d{1,2})?|\*)\b|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(?:\/\d{1,3})?|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}(?:\/\d{1,3})?|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}(?:\/\d{1,3})?|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}(?:\/\d{1,3})?|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}(?:\/\d{1,3})?|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}(?:\/\d{1,3})?|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}(?:\/\d{1,3})?|(?:[0-9a-fA-F]{1,4}:){1,7}:(?:\/\d{1,3})?|:(?::[0-9a-fA-F]{1,4}){1,7}(?:\/\d{1,3})?/,
            'ontap-size': /\b\d+(?:\.\d+)?[ \t]*(?:KB|MB|GB|TB|PB)\b/i,
            'ontap-number': /\b\d+(?:\.\d+)?\b/,
            'ontap-value': /\S+/,
          },
        },

        // Command name (words after prompt, before first -param).
        'ontap-command': {
          pattern: /^(\s*)[a-z]+(?:\s+[a-z]+)*/,
          lookbehind: true,
        },

      },
    },

  };
};
