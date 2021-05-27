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

# Update the other components that use this library

A number of the prexit components use this library, and manually updating them all can be a drag.  To simplify this,
a script is provided that can patch the package.json file and open a merge request on each component.

You'll need python3 installed to run it.

```bash
cd scripts
./rollout_updated_version.py --help
./rollout_updated_version.py --token {gitlab-token} --all-my-repos
```

In order to run it, you'll need to create a gitlab API token under your username.  You can go this by going to your avatar
at the top-right of the Gitlab window, selecting **Preferences** from the dropdown menu and then going to **Access Tokens**
on the left-hand side of the screen.

Create a name for the access token and tick "API" under "Scopes".

Copy the presented string and save it somewhere secure (DON'T put it into this repo!!!!)

You can then run the script, as above, which will:
- iterate all of the Github projects you 'own'
- try to find a package.json file in each of them
- if a package.json file is found, download the current master version and try to find "pluto-headers" under "dependencies"
- if found, parse the git string and extract the version number and compare it to the version specified in the local package.json
for pluto-headers.
- if they don't match, create a branch, update the package.json in the remote project to the version of pluto-headers that
the script is running from, commit that and create a merge request.
- if the project does not have 'package.json', or it doesn't import pluto-headers, etc., it will be left alone.


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
