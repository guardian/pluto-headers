# Pluto Headers

Pluto headers is used as a base with header components for all pluto apps.

The components consists of

- Header component with the purpose of being used as a web page header with a logo in the pluto applications.
- AppSwitcher component used for displaying menu selections by configuration, show who you are logged in as and a log in / log out button.
- Util interceptor for handling unauthorized requests in axios.

# React component library

Since this is a react component library with dependencies such as react and material ui, it is required that these are used as peerDependencies, otherwise these would collide with the external applications dependencies that is using this react component library.

# Build and publish

- Build

  ```
  yarn && yarn build
  ```

- Publish
  - Commit the changes
  - Create a new version
    ```
    yarn version
    ```
  - Push the changes
    ```
    git push --follow-tags
    ```

# Local development

- Build

  ```
  yarn && yarn build
  ```

- Remove the devDependencies that are the same as peerDependecies by removing them from package.json and do a yarn install. Otherwise the devDependencies will collide during local development with the external repository.

  The hard way of doing this is to npm link these devDependencies from this repository to the external repository.

- In external repository package.json, update pluto-headers dependency by adding a relative path to the root

  ```
  "pluto-headers": "file:<relative-path-to-pluto-headers-root>"
  ```

- In external repository, install the added dependency
  ```
  yarn
  ```
