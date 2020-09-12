[![Cryb OSS](.github/web-icon.png "@cryb/web Logo")](https://cryb.app)

**@cryb/web** - _Web client_

[![GitHub contributors](https://img.shields.io/github/contributors/crybapp/web)](https://github.com/crybapp/web/graphs/contributors) [![License](https://img.shields.io/github/license/crybapp/web)](https://github.com/crybapp/web/blob/master/LICENSE) [![Patreon Donate](https://img.shields.io/badge/donate-Patreon-red.svg)](https://patreon.com/cryb) [![Chat on Discord](https://discord.com/api/guilds/594942455749672983/widget.png)](https://discord.gg/xdhEgD5)

## Docs

* [Info](#info)
  * [Status](#status)
* [Codebase](#codebase)
  * [Folder Structure](#folder-structure)
  * [First time setup](#first-time-setup)
    * [Installation](#installation)
  * [Running the app locally](#running-the-app-locally)
    * [Background services](#background-services)
    * [Starting @cryb/web](#starting-@cryb/web)
* [Questions / Issues](#questions--issues)

## Info

`@cryb/web` is the primary web client for interacting with Cryb instances (running in `@cryb/api`).

`@cryb/web` is used by clients to create rooms, view VM streams, control the VM and chat with other room members.

You can watch a demo of `@cryb/web` [here](https://youtu.be/pGNMZ98RwZY).

### Status

`@cryb/web` has been actively developed internally since August 2019, and is now open source as of October 2019.

## Codebase

The codebase for `@cryb/web` is written in HTML and JS, utilising Vue and Nuxt.js, plus `@cryb/borealis` for the CSS styles.

### Folder Structure

```
cryb/web/
├── components # The core components
├── layouts # Layouts
├── middleware # Middleware for authentication, etc
├── pages # Our main pages
├── static # Static assets such as icons and stylesheets
└── store # Our Vuex store configuration
```

### First time setup

First, clone the `@cryb/web` repository locally:

```
git clone https://github.com/crybapp/web.git
```

#### Installation

The following services need to be installed for `@cryb/web` to function:

* `@cryb/api`

We recommend that you run the following services alongside `@cryb/web`, but it's not required.

* `@cryb/aperture` or Janus WebRTC Server

You also need to install the required dependencies by running `yarn`.

Ensure that `.env.example` is either copied and renamed to `.env`, or is simply renamed to `.env`.

In this file, you'll need some values. Documentation is available in the `.env.example` file.

### Running the app locally

#### Background Services

Make sure that you have installed `@cryb/api`.

If you're developing a feature that requires the VM infrastructure, then make sure either `@cryb/aperture` or Janus WebRTC server is running.

#### Starting @cryb/web

To run `@cryb/web` in development mode, run `yarn dev`.

It is recommended that in production you run `yarn build`, then `yarn start`.

## Questions / Issues

If you have any issues with `@cryb/web`, please either open a GitHub issue, contact a maintainer or join the [Cryb Discord Server](https://discord.gg/xdhEgD5) and ask in `#tech-support`.

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcrybapp%2Fweb.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcrybapp%2Fweb?ref=badge_large)
