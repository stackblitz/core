<h1 id="overview">Documentation</h1>

Welcome to StackBlitz! We've created this documentation to help answer any questions you may have about what StackBlitz is, how to use it and what its APIs are.

### Just learning about StackBlitz?
Take a look at our [announcement post](https://medium.com/@ericsimons/stackblitz-online-vs-code-ide-for-angular-react-7d09348497f4) which covers our core functionality, feature set and motivations behind the project.

### Curious how our technology works?
We recommend [reading the writeup](https://medium.com/@ericsimons/introducing-turbo-5x-faster-than-yarn-npm-and-runs-natively-in-browser-cc2c39715403) we did and checking out our [Github repo](https://github.com/stackblitz/core).



# Embedding

On StackBlitz.com, you can create new projects and get the embed code from the 'Share' dropdown link in the top navigation like so:

<img src="https://i.imgur.com/a0pJ3nj.png" />

Then just paste the embed code in an iframe and you're good to go!

```html
<iframe src="https://stackblitz.com/edit/angular?embed=1"></iframe>
```

Alternatively, you can also use our [Javascript SDK methods](#open-and-embed-stackblitz-projects) for easily embedding StackBlitz projects on the page & avoid all the hassles of creating/configuring iframes.

## Embed Options

<table>
  <tr>
    <td><code>file</code></td>
    <td>File path</td>
    <td>The default file to have open in the editor</td>
  </tr>
  <tr>
    <td><code>embed</code></td>
    <td><code>0</code> / <code>1</code></td>
    <td>Force embed view regardless of screen size</td>
  </tr>
  <tr>
    <td><code>hideExplorer</code></td>
    <td><code>0</code> / <code>1</code></td>
    <td>Hide file explorer pane in embed view</td>
  </tr>
  <tr>
    <td><code>hideNavigation</code></td>
    <td><code>0</code> / <code>1</code></td>
    <td>Hide the browser navigation UI</td>
  </tr>
  <tr>
    <td><code>ctl</code></td>
    <td><code>0</code> / <code>1</code></td>
    <td>Require user to 'click to load' the embed</td>
  </tr>
  <tr>
    <td><code>view</code></td>
    <td><code>editor</code> / <code>preview</code></td>
    <td>Which view to open by default</td>
  </tr>
  <tr>
    <td><code>hidedevtools</code></td>
    <td><code>0</code> / <code>1</code></td>
    <td>Hide the debugging console in the editor preview</td>
  </tr>
  <tr>
    <td><code>devtoolsheight</code></td>
    <td><code>0</code> &lt; <code>height</code> &lt; <code>1000</code></td>
    <td>Set the height of the debugging console in the editor preview</td>
  </tr>
</table>

## Embed on Medium

In your Medium article, simply take your project URL (i.e. https://stackblitz.com/edit/angular) and paste it. After you hit enter, it should automatically become an embed.

# Importing Projects

## Upload From Your Computer

With your desired StackBlitz project open, simply drag and drop any files and folder you want to import:

<img src="https://i.imgur.com/7F9r1xw.gif" />

## Import from Github

You can run any public repo on Github by providing the username + repo name like so:

`https://stackblitz.com/github/{GH_USERNAME}/{REPO_NAME}`

And you can also optionally specify a branch, tag, or commit:

`.../github/{GH_USERNAME}/{REPO_NAME}/tree/{TAG|BRANCH|COMMIT}`

### Automatically stays in sync with your repo
Whenever you push commits to Github, the corresponding StackBlitz project automatically updates with the latest changes — ensuring Github remains your code’s source of truth.

### Supported project types

We currently support projects using `@angular/cli` and `create-react-app`. Support for Ionic, Vue, and custom webpack configs is coming soon!

## StackBlitz API

You can create new StackBlitz projects programmatically from any data source using our [POST API](#post-api) or the [openProject](#sdk-openproject-project-opts) & [embedProject](#sdk-embedproject-elementorid-project-embedopts) methods in our [Javascript SDK](#javascript-sdk).


# Javascript SDK

Wouldn't it be great if you could create & embed StackBlitz projects on-demand in your docs, examples, blog posts... in just a couple lines of code?

This is exactly what our Javascript SDK allows you to do. Even better, the SDK even gives you full control of the StackBlitz VM- allowing you to build rich & interactive experiences around your projects.

The SDK is **2kb gzipped** (!) and you can install it from NPM:

```sh
npm install --save @stackblitz/sdk
```

Or add a script tag to the UMD build on jsDelivr/Unpkg — the SDK will be available on window as `StackBlitzSDK`:

```html
<script src="https://unpkg.com/@stackblitz/sdk/bundles/sdk.umd.js"></script>
```

## Generate and Embed New Projects

Creating custom projects on-demand from any data source is super simple with the SDK. There are two methods for doing this:

- [`openProject`](#sdkopenprojectproject-opts) to create a new project & open it in a new tab (or current window).
- [`embedProject`](#sdkembedprojectelementorid-project-embedopts) to create a new project & embed it on the current page.

**[View live demo on StackBlitz.](https://stackblitz.com/edit/sdk-create-project)**

### <span class="fn">sdk.openProject(<span class="args">project[, opts]</span>)</span>

Create a new project and open it in a new tab (or in the current window).

#### Project payload

```ts
{
  files: {[path: string]: string};
  title: string;
  description: string;
  template: 'angular-cli' | 'create-react-app' | 'typescript' | 'javascript';
  tags?: string[];
  dependencies?: {[name: string]: string};
  settings?: {
    compile?: {
      trigger?: 'auto' | 'keystroke' | 'save';
      action?: 'hmr' | 'refresh';
      clearConsole?: boolean;
    };
  };
}
```

#### Options

```ts
{
  openFile?: string; // Show a specific file on page load
  newWindow?: true // Open in new window or in current window
  hideDevTools?: boolean; // Hide the debugging console
  devToolsHeight?: number; // Set the height of the debugging console
}
```

#### Required files for templates

<table>
  <tr>
    <td><code>angular-cli</code></td>
    <td>Requires <b>index.html</b> and <b>main.ts</b> to be present</td>
  </tr>
  <tr>
    <td><code>create-react-app</code></td>
    <td>Requires <b>index.html</b> and <b>index.js</b> to be present</td>
  </tr>
  <tr>
    <td><code>typescript</code></td>
    <td>Requires <b>index.html</b> and <b>index.ts</b> to be present</td>
  </tr>
  <tr>
    <td><code>javascript</code></td>
    <td>Requires <b>index.html</b> and <b>index.js</b> to be present</td>
  </tr>
</table>


### <span class="fn">sdk.embedProject(<span class="args">elementOrId, project[, embedOpts]</span>)</span>

Create a new project and embed it on the current page. Returns a promise resolving it's [VM instance](#controlling-the-vm).

`elementOrId`: Either an element's ID string or the target HTMLElement itself.

`project`: The same [project payload](#project-payload) as the `openProject` method.

`embedOpts`: Optional argument that allows you to implement various embed controls:

#### Embed options

```ts
{
  openFile?: string; // Show a specific file on embed load
  clickToLoad?: boolean; // Load editor only when clicked ("click to load")
  view?: 'preview' | 'editor';
  height?: number | string;
  width?: number | string;
  hideExplorer?: boolean;
  hideNavigation?: boolean;
  forceEmbedLayout?: boolean; // Disables the full stackblitz UI on larger screen sizes
}
```

## Open and Embed Github Repos

Yup, you can point directly at Github repos containing Angular/React projects and it'll automatically pull them down & run them.

**[View live demo on StackBlitz.](https://stackblitz.com/edit/sdk-github-project)**

### <span class="fn">sdk.openGithubProject(<span class="args">repoSlug[, opts]</span>)</span>

Open a project from Github and open it in a new tab (or in the current window).

`repoSlug`: String of the Github username, repo and optionally branch/tag/commit.

`opts`: The same [options object](#options) as `openProject`

### <span class="fn">sdk.embedGithubProject(<span class="args">elementOrId, repoSlug[, embedOpts]</span>)</span>

Embeds a project from Github on the current page. Returns a promise resolving it's [VM instance](#controlling-the-vm).

`elementOrId`: Either an element ID string or the target HTMLElement itself.

`repoSlug`: String of the Github username, repo and optionally branch/tag/commit.

`embedOpts`: Optional [embed options](#embed-options) object


## Open and Embed StackBlitz Projects

If you have a specific StackBlitz project ID you want to open or embed, you can use these methods:

### <span class="fn">sdk.openProjectId(<span class="args">projectId[, opts]</span>)</span>

Open an existing StackBlitz project in a new tab (or in the current window).

`projectId`: The ID of the StackBlitz project to open

`opts`: The same [options object](#options) as `openProject`

### <span class="fn">sdk.embedProjectId(<span class="args">elementOrId, projectId[, embedOpts]</span>)</span>

Embeds an existing StackBlitz project on the current page. Returns a promise resolving it's [VM instance](#controlling-the-vm).

`elementOrId`: Either an element ID string or the target HTMLElement itself.

`projectId`: The ID of the StackBlitz project to open

`embedOpts`: Optional [embed options](#embed-options) object


## Controlling the VM

All of the embed methods on the SDK automatically connect to the embedded StackBlitz VM and return a promise containing an initialized `VM` class. This allows you to have programmatic access of the file system, package manager, editor, and more.

> **Note:** The VM API's are currently under active development—we'd love to [hear your feedback](https://discord.gg/stackblitz).

**[View live demo on StackBlitz.](https://stackblitz.com/edit/sdk-vm)**

### <span class="fn">vm.applyFsDiff(<span class="args">diff</span>)</span>

Apply batch updates to the FS in one call. Returns a promise.

`diff`: A [diff object](#diff-object) containing files to create and delete.

#### DIFF OBJECT

```ts
{
  create: {
    [path: string]: string // path=>contents of files to create
  },
  destroy: string[] // Paths of files to delete
}
```

### <span class="fn">vm.getFsSnapshot()</span>

Get a snapshot of the entire FS. Returns a promise resolving the file system object.

### <span class="fn">vm.editor.openFile(<span class="args">path</span>)</span>

Open a file in the editor that exists in the current FS. Returns a promise.

`path`: String of entire file path (i.e. 'somefolder/index.js')

### <span class="fn">vm.preview.origin</span>

String. The URL of the preview domain that the user can open in new tab(s) as they use the embed. Every project created with the `embedProject` method gets its own unique preview URL.

### <span class="fn">vm.getDependencies()</span>

Returns a promise resolving an object containing the currently installed dependencies with corresponding version numbers.

# POST API

Create new projects by simply POSTing the desired project data from a form— useful when you don't/can't use our Javascript SDK.

## Required form fields

```
project[title] = Project title
project[description] = Project description
project[files][FILE_PATH] = Contents of file, specify file path as key
project[files][ANOTHER_FILE_PATH] = Contents of file, specify file path as key
project[dependencies] = JSON string of dependencies field from package.json
project[template] = Can be one of: typescript, angular-cli, create-react-app, javascript
```

You can also optionally include tags:

```
project[tags][] = rxjs
project[tags][] = example
```

## Example payload

Below is an example HTML form that generates a project from the RxJS docs using the `typescript` template:

```html
<html lang="en">
<head></head>
<body>

<form id="mainForm" method="post" action="https://stackblitz.com/run" target="_self">
<input type="hidden" name="project[files][index.ts]" value="import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/scan';

var button = document.querySelector('button');
Observable.fromEvent(button, 'click')
  .scan((count: number) => count + 1, 0)
  .subscribe(count => console.log(`Clicked ${count} times`));
">
<input type="hidden" name="project[files][index.html]" value="<button>Click Me</button>
">
<input type="hidden" name="project[tags][]" value="rxjs">
<input type="hidden" name="project[tags][]" value="example">
<input type="hidden" name="project[tags][]" value="tutorial">
<input type="hidden" name="project[description]" value="RxJS Example">
<input type="hidden" name="project[dependencies]" value="{&quot;rxjs&quot;:&quot;5.5.6&quot;}">
<input type="hidden" name="project[template]" value="typescript">
<input type="hidden" name="project[settings]" value="{&quot;compile&quot;:{&quot;clearConsole&quot;:false}}">
</form>
<script>document.getElementById("mainForm").submit();</script>

</body></html>
```
