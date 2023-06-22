# famhand

A node script to keep Github repo fresh for WordPress plugins.


## Install

```
npm install --save-dev @tarosky/farmhand
```

## GitHub Actions

GitHub Action is also [available](https://github.com/marketplace/actions/check-up-to-date-with-wp). Please check it to keep your plugin fresh.

## Commands

2 CLI commands are available.

### wp-outdated

Mainly for debugging. You can check if your repository follows WordPress updates.

```
npx wp-outdated
// -> [UPDATE] Test Wordpress version from "5.8" to "6.2"
```

### wp-str-search

Download and search string throughout multiple WordPress. What is this for?

Let's think about [@wordpress/server-side-render](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-server-side-render/) package as an example.

This package was formerly grouped in `wp.components`, but after several versions for backward compatibility, finally dropped in WordPress 6.2.

Cause this may change your plugin's minimum requirements, so you should know which version `@wordpress/server-side-render` is introduced.

```
npx wp-str-search wp-server-side-render --oldest=5.0
```

## License

This program is licensed under MIT.

&copy; 2023 Tarosky INC.