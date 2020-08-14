# Pluto Headers

Pluto headers is used as a base with header components for all pluto apps.

The components consists of a Header component with the purpose of being used as a web page header in the pluto applications, the header may for example contain a web application logo.
And also an AppSwitcher component used for displaying menu selections by configuration, show who you are logged in as and a log in / log out button.

# React component library

Since this is a react component library with dependencies such as react and material ui, it is required that these are used as peerDependencies, otherwise these would collide with the external applications dependencies that is using this react component library.

# Build and publish

- Build

  ```
  yarn && yarn build
  ```

- Publish
  - Commit and push the changes

# Local development

- Build

  ```
  yarn && yarn build
  ```

- In external repository package.json, update pluto-headers dependency by adding a relative path to the root

  ```
  "pluto-headers": "file:<relative-path-to-pluto-headers-root>"
  ```

- In external repository, install the added dependency
  ```
  yarn
  ```
