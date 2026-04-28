# prism-ontap-cli

[![CI](https://github.com/pulkjr/prism-ontap-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/pulkjr/prism-ontap-cli/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/prism-ontap-cli)](https://www.npmjs.com/package/prism-ontap-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A [Prism.js](https://prismjs.com/) language definition for **NetApp ONTAP 9.x CLI** syntax highlighting, plus two ready-made CSS themes (OneDark nvim dark and One Light).

Use it with **Docusaurus**, **VitePress**, **Next.js**, plain HTML, or any other Prism-powered site to colorize ONTAP CLI code blocks.

---

## What gets highlighted

| Token | Color (dark) | What it matches |
|---|---|---|
| `ontap-prompt` | gray | Standard prompt — `cluster1::>`, `vs1::>` |
| `ontap-prompt-elevated` | **bold white** | Elevated prompt — `cluster1::*>` (advanced/diag mode) |
| `ontap-command` | green | Command name — `volume show`, `security audit log show` |
| `ontap-param` | purple | Parameter flags — `-vserver`, `-state`, `-role` |
| `ontap-value` | yellow | Unquoted text values — `admin`, `ssh`, `node1` |
| `ontap-string` | yellow italic | Quoted string values — `"Mon Jan 03 18:37:05 2022"` |
| `ontap-boolean` | orange | State/boolean keywords — `up`, `down`, `online`, `true`, `false`, `enabled`, `disabled`, `pending`, `success`, `error` |
| `ontap-ip` | cyan | IPv4 addresses — `10.60.250.79`, `192.168.1.0/24`, `10.60.*` |
| `ontap-size` | blue | Storage sizes — `100GB`, `2.5TB`, `512MB` |
| `ontap-number` | orange | Numeric values — `5`, `100`, `3.14` |
| `ontap-output-separator` | dark gray | Column separator lines — `--- ---` |
| `ontap-output-header` | **white bold** | Column header row (line before separator) |
| `ontap-output-count` | gray italic | Count line — `2 entries were displayed.` |

---

## Installation

```bash
npm install prism-ontap-cli
```

**Peer dependency:** `prismjs >= 1.27.0` (or any library that bundles Prism, such as `prism-react-renderer`).

---

## Usage

### Docusaurus

Add the language in a [Root wrapper](https://docusaurus.io/docs/swizzling#wrapper) component:

```jsx
// src/theme/Root.js
import React from 'react';
import { Prism } from 'prism-react-renderer';
import defineOntapCli from 'prism-ontap-cli';

defineOntapCli(Prism);

export default function Root({ children }) {
  return <>{children}</>;
}
```

Then import a theme in your global CSS (e.g. `src/css/custom.css`):

```css
/* Dark theme */
@import 'prism-ontap-cli/themes/dark';

/* or Light theme */
@import 'prism-ontap-cli/themes/light';
```

Mark code blocks with the `ontap-cli` language identifier in Markdown:

````markdown
```ontap-cli
cluster1::> volume show -vserver vs1 -state online
```
````

### Plain HTML (`<script>` tag)

```html
<!-- 1. Prism core -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>

<!-- 2. ONTAP language definition (standalone build) -->
<script src="node_modules/prism-ontap-cli/standalone/prism-ontap-cli.js"></script>

<!-- 3. ONTAP color theme (dark or light) -->
<link rel="stylesheet" href="node_modules/prism-ontap-cli/themes/prism-ontap-dark.css" />

<!-- 4. Use the language in a code block -->
<pre><code class="language-ontap-cli">cluster1::> volume show</code></pre>
```

### Vite / Next.js / webpack (ESM)

```js
import Prism from 'prismjs';
import defineOntapCli from 'prism-ontap-cli';

defineOntapCli(Prism);
Prism.highlightAll();
```

Import the theme in your main CSS entry point:

```css
@import 'prism-ontap-cli/themes/dark';
```

### CommonJS (Node.js / older bundlers)

```js
const Prism = require('prismjs');
const defineOntapCli = require('prism-ontap-cli');

defineOntapCli(Prism);
```

---

## Themes

Two ready-made themes are included. Import whichever suits your site.

| Theme file | Description |
|---|---|
| `themes/prism-ontap-dark.css` | **OneDark nvim** — dark background (`#282c34`) |
| `themes/prism-ontap-light.css` | **One Light** — light background (`#fafafa`) |

You can also write your own theme — just target the CSS classes in the table above.

### Using both themes with `prefers-color-scheme`

```css
@import 'prism-ontap-cli/themes/prism-ontap-light.css';

@media (prefers-color-scheme: dark) {
  /* Override with dark palette */
  code[class*="language-ontap-cli"],
  pre[class*="language-ontap-cli"] { background: #282c34; color: #abb2bf; }
  .token.ontap-prompt             { color: #5c6370; }
  .token.ontap-prompt-elevated    { color: #dcdfe4; font-weight: bold; }
  .token.ontap-command            { color: #98c379; }
  .token.ontap-param              { color: #c678dd; }
  .token.ontap-value              { color: #e5c07b; }
  .token.ontap-string             { color: #e5c07b; font-style: italic; }
  .token.ontap-boolean            { color: #d19a66; }
  .token.ontap-ip                 { color: #56b6c2; }
  .token.ontap-size               { color: #61afef; }
  .token.ontap-number             { color: #d19a66; }
  .token.ontap-output-separator   { color: #3e4451; }
  .token.ontap-output-header      { color: #dcdfe4; font-weight: bold; }
  .token.ontap-output-count       { color: #5c6370; font-style: italic; }
}
```

---

## Supported syntax

### Prompt variants

| Example | Mode |
|---|---|
| `cluster1::>` | Standard admin |
| `cluster1::*>` | Advanced / diagnostic privilege (elevated) |
| `vs1::>` | SVM (vserver) admin |
| `cluster1::vserverctx>` | Cluster with vserver context |

### Command syntax

```
<prompt> <command-name> [-param [value]]...
```

- **Command name** — one or more lowercase words separated by spaces (e.g. `security audit log show`)
- **Parameters** — flags starting with `-` (e.g. `-vserver`, `-state`, `-fields`)
- **Values** — text, quoted strings, booleans, IPs, sizes, or numbers

### Value types

| Input | Token |
|---|---|
| `admin`, `ssh`, `node1` | `ontap-value` |
| `"Mon Jan 03 18:37:05 2022"` | `ontap-string` |
| `up`, `down`, `online`, `true`, `false` | `ontap-boolean` |
| `10.60.250.79`, `192.168.1.0/24`, `10.60.*` | `ontap-ip` |
| `100GB`, `2.5TB`, `512MB` | `ontap-size` |
| `5`, `100` | `ontap-number` |
| `Error\|Success` | pipe-alternatives, tokenized as `ontap-value` |

> **Tip:** The `-fields` parameter supports comma-separated field names.
> `prism-ontap-cli` handles comma-separated lists with no spaces
> (`-fields vserver,volume,aggregate`) correctly. Lists with spaces after commas
> (`-fields vserver, volume`) may tokenize each word individually — this is a known
> limitation.

### ONTAP version

This package targets **ONTAP 9.x**. The CLI syntax has been consistent throughout the
9.x release train. It may work with ONTAP 8.x but is not tested against those releases.

---

## Examples

Open [examples/index.html](examples/index.html) in a browser for a live demo with a
light/dark theme toggle. The demo includes:

1. `volume show` — simple command with tabular output
2. `security audit log show` — multiple params, pipe-separated values, quoted timestamp
3. Advanced privilege mode — elevated `::*>` prompt
4. Vserver context — SVM admin prompt
5. `network interface show` — IP addresses and boolean status values

---

## Contributing

1. Fork the repository and create a branch.
2. `npm install` — installs dev dependencies.
3. Make your changes in `src/prism-ontap-cli.js` (ESM) and mirror them in `src/prism-ontap-cli.cjs`.
4. `npm test` — run the smoke tests.
5. `npm run lint` — check for lint issues.
6. Open a pull request.

### Reporting issues

Please include a minimal ONTAP CLI snippet that demonstrates the problem.

---

## License

MIT © Contributors
