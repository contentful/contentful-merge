ccccli
=================

Content Changeset Creation CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ccccli
$ ccccli COMMAND
running command...
$ ccccli (--version)
ccccli/0.0.0 darwin-x64 node-v16.15.1
$ ccccli --help [COMMAND]
USAGE
  $ ccccli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ccccli hello PERSON`](#ccccli-hello-person)
* [`ccccli hello world`](#ccccli-hello-world)
* [`ccccli help [COMMAND]`](#ccccli-help-command)
* [`ccccli plugins`](#ccccli-plugins)
* [`ccccli plugins:install PLUGIN...`](#ccccli-pluginsinstall-plugin)
* [`ccccli plugins:inspect PLUGIN...`](#ccccli-pluginsinspect-plugin)
* [`ccccli plugins:install PLUGIN...`](#ccccli-pluginsinstall-plugin-1)
* [`ccccli plugins:link PLUGIN`](#ccccli-pluginslink-plugin)
* [`ccccli plugins:uninstall PLUGIN...`](#ccccli-pluginsuninstall-plugin)
* [`ccccli plugins:uninstall PLUGIN...`](#ccccli-pluginsuninstall-plugin-1)
* [`ccccli plugins:uninstall PLUGIN...`](#ccccli-pluginsuninstall-plugin-2)
* [`ccccli plugins update`](#ccccli-plugins-update)

## `ccccli hello PERSON`

Say hello

```
USAGE
  $ ccccli hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/marcolink/ccccli/blob/v0.0.0/dist/commands/hello/index.ts)_

## `ccccli hello world`

Say hello world

```
USAGE
  $ ccccli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ ccccli hello world
  hello world! (./src/commands/hello/world.ts)
```

## `ccccli help [COMMAND]`

Display help for ccccli.

```
USAGE
  $ ccccli help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ccccli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.15/src/commands/help.ts)_

## `ccccli plugins`

List installed plugins.

```
USAGE
  $ ccccli plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ccccli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.4/src/commands/plugins/index.ts)_

## `ccccli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ ccccli plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ ccccli plugins add

EXAMPLES
  $ ccccli plugins:install myplugin 

  $ ccccli plugins:install https://github.com/someuser/someplugin

  $ ccccli plugins:install someuser/someplugin
```

## `ccccli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ccccli plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ ccccli plugins:inspect myplugin
```

## `ccccli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ ccccli plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ ccccli plugins add

EXAMPLES
  $ ccccli plugins:install myplugin 

  $ ccccli plugins:install https://github.com/someuser/someplugin

  $ ccccli plugins:install someuser/someplugin
```

## `ccccli plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ ccccli plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ ccccli plugins:link myplugin
```

## `ccccli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ccccli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ccccli plugins unlink
  $ ccccli plugins remove
```

## `ccccli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ccccli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ccccli plugins unlink
  $ ccccli plugins remove
```

## `ccccli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ccccli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ccccli plugins unlink
  $ ccccli plugins remove
```

## `ccccli plugins update`

Update installed plugins.

```
USAGE
  $ ccccli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
