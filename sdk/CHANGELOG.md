# @stackblitz/sdk changelog

## v1.8.1 (2022-11-10)

- Fixed the case of the URL query parameters for the `hideDevTools` and `devToolsHeight` options, for backwards compatibility with StackBlitz EE. (#2154)

## v1.8.0 (2022-06-09)

- Added a `terminalHeight` option, used to set a preferred height for the Terminal in WebContainers-based projects. (#1891)

## v1.7.0 (2022-05-09)

- TypeScript: improved the precision and inline documentation of types such as `Project`, `EmbedOptions`, `OpenOptions` and `VM`. Made those types directly importable with `import type { Project } from '@stackblitz/sdk'`. (#1775, #1779, #1837)
- Added support for opening multiple files in an embedded projects with the `vm.editor.openFile` method. (#1810)
- Added new methods to the `VM` class for controlling the embedded editor’s UI: `vm.editor.setCurrentFile`, `vm.editor.setTheme`, `vm.editor.setView`, `vm.editor.showSidebar`, `vm.preview.getUrl`, `vm.preview.setUrl`. (#1810, #1837)
- Added new `showSidebar` option. (#1837)
- Added source maps to the published bundle files. (#1776)
- Fixed the default value of the `forceEmbedLayout` option. (#1817)

## v1.6.0 (2022-03-02)

- Add support for opening multiple files with the openFile parameter, with support for multiple tabs (`openFile: 'index.html,src/index.js'`) and split editor panes (`openFile: ['index.html', 'src/index.js]`). (#1758)

## v1.5.6 (2022-02-04)

- Add `template: 'html'` to the allowed project templates. (#1728)

## v1.5.5 (2022-01-26)

- Fix broken type declarations in previous v1.5.4. (#1722)

## v1.5.4 (2022-01-20)

- Add `template: 'node'` to the allowed project templates. (#1714)
- Remove support for the `tags` option when creating new projects. (#1714)

## v1.5.3 (2021-11-05)

- Fix: correct type for `EmbedOptions['view']`. (#1655)
- Fix: set the `EmbedOptions`’s `hideNavigation` UI option correctly. (#1654)

## v1.5.2 (2020-12-07)

_No known changes._

## v1.5.1 (2020-09-25)

- Add `template: 'vue'` to the allowed project templates. (#1307)

## v1.5.0 (2020-07-16)

- Add a `theme` option to `ProjectOptions` to set the editor’s color theme. (#1269)

## v1.4.0 (2020-05-13)

- Add `origin` option to `ProjectOptions` to allow embedding projects from StackBlitz Enterprise Edition. (#1236)

## v1.3.0 (2019-02-06)

- Add `template: 'polymer'` to the allowed project templates. (#859)

## v1.2.0 (2018-05-03)

- Add support for editor UI options: `hideDevTools` and `devToolsHeight`.
- Add support for project compilation settings in `ProjectOptions`.
