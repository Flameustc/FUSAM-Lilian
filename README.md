# BC Addon Manager

One stop shop for addon installation for BC.

This repository is the Lilian fork of upstream [FUSAM](https://gitlab.com/Sidiousious/bc-addon-loader). GitHub Pages publishes the `dev` branch to <https://flameustc.github.io/FUSAM-Lilian/>. `config.js`, the userscript, and the install-page bookmark all load that host. `build.sh` rewrites a localhost dev copy to the same host.

Kept on top of upstream:

- `LilianMod` stays in `manifest.json` and installs from <https://flameustc.github.io/BCLilianMod/main.js> (source: <https://github.com/Flameustc/BCLilianMod>).
- BCX keeps a `Lilian` distribution at <https://flameustc.github.io/BCX-Lilian/bcx.js>. Upstream only accepts `stable`, `beta`, and `dev`, so this fork's manifest check also accepts `Lilian`. Saved BCX settings that already say `Lilian` still resolve.
- There is no cheat whitelist in this loader. The sensory-deprivation whitelist for Lilian's subs is implemented in BCLilianMod and remains available because the `LilianMod` entry is still published.

## Users

This provides you with a single interface to toggle addons developed by the community. Installation for this fork is the [FUSAM-Lilian page](https://flameustc.github.io/FUSAM-Lilian/). Upstream's own instructions remain at <https://sidiousious.gitlab.io/bc-addon-loader/>.

## Developers

For addon developers this means you do not have to include the modding SDK or have your own instructions for users to install your addon; simply point them here.

To get your addon added, either join the [BC Scripting Community Discord](https://discord.gg/SHJMjEh9VH) and ask there or create a merge request for manifest.json. The following information is required:

- short name / ID, alphanumeric
- long name
- short description
- author name
- link to the script

You may optionally also provide:

- link to a source code repository
- link to a website for more information
- additional distributions (beta/dev versions)

### Localized addon metadata

`name` and `description` may be either a string or a language map. In AUTO mode, FUSAM checks the
browser's ordered language preferences and uses the first supported match, falling back to English.
Users can also select a language manually in the Addon Manager. The supported language codes are
`TW`, `CN`, `EN`, `DE`, `FR`, `RU`, `UA`, and `ES`.

```json
{
    "id": "example-addon",
    "name": {
        "EN": "Example Addon",
        "TW": "範例插件",
        "CN": "示例插件"
    },
    "description": {
        "EN": "An example description.",
        "TW": "範例介紹。",
        "CN": "示例介绍。"
    }
}
```

Keep `id` stable and untranslated. Submit localized addon names and descriptions directly to this
repository. For larger text catalogs inside an addon, use separate translation files and select
them with the browser's ordered language preferences.

### Developing an Addon for FUSAM

You need a [local HTTP server](https://gist.github.com/willurd/5720255) that serves your js file. Open the club and add `?fusam=http://localhost:<your_port>/<your_file>.js&fusamType=<module/script/eval>` replacing the `<placeholders>`, and you will be able to load your development addon as "Local Development by You" inside FUSAM.

### Making changes to FUSAM

You can also serve your dev version of FUSAM by doing the following:

- run `npm run serve`
- open http://localhost:3001/loader.user.js to load in ViolentMonkey/TamperMonker. Either replace the production version or add it as a duplicate (just disable the one you don't use).

The committed `loader.user.js` imports `https://flameustc.github.io/FUSAM-Lilian/fusam.js` because GitHub Pages publishes this tree without running `build.sh`. To exercise local loader code, temporarily point that import at `http://localhost:3001/fusam.js` before installing the userscript. `build.sh` rewrites `http://localhost:3001` to the Flame host when producing a `public/` build.

### Contributing

If you'd like to see improvements in the loader itself, you can create an issue or discuss in the Discord linked above.
