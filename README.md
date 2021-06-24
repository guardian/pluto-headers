# Pluto Headers

Pluto headers is used as a base with header components for all pluto apps.

The components are:

## Header
The "Header" is the static blue bar that sits across the top of all the pluto
components and looks like this:
![Header bar image](doc/Headerbar.png)

Usage: 
```jsx
  <Header/>
```
## AppSwitcher
The "AppSwitcher" is the menu bar which also provides log-in/log-out functionality:
![App switcher image](doc/Appswitcher.png)

The actual content from the menus is loaded from a file which is expected to be presented at
`/meta/menu-config/menu.json`.

This is provided by the pluto-start component and is over-ridden by runtime configuration in the 
actual deployment.

It's expected to take the form of an array of objects, like this:

```json
[
  {
    "type": "{link|submenu}",
    "text": "Presented text",
    "href": "https://link.location [only for the 'link'] type",
    "content": [
      //[only for the 'submenu' type]
      {
        "type": "link",
        "text": "Presented text",
        "href": "https://link.location"
      }
    ]
  }
]
```

The app switcher also loads in oauth configuration for the purpose of initiating
the oauth login flow by sending the user to the IdP when you click the 'login" button.

It supports callbacks to notify a parent of login/logout events

Usage:
```jsx 
  <AppSwitcher
    onLoggedIn={()=>alert("user logged in")}
    onLoggedOut={()=>alert("user logged out")}
    onLoginValid={(valid, jwtDataShape)=>alert(`login ${valid ? "was" : "was not"} valid. User profile data: ${jwtDataShape}`)}
  />
```


## Breadcrumb
![Breadcrumbs image](doc/Breadcrumb.png)

The breadcrumb is a commission -> project -> master trail that is used at the top of pluto-core and
pluto-deliverables pages to allow the user to directly jump to parent objects, even across apps.

It performs REST requests to the relevant (pluto-core or pluto-deliverables) backend in order to
determine the presentable information for a given deliverable or project.

masterId?: number;
projectId?: number;
commissionId?: number;
plutoCoreBaseUri?: string;

Usage:
```jsx
  <Breadcrumb
    masterId={optionalMasterIdNumber}
    projectId={optionalProjectIdNumber}
    commissionId={optionalCommissionIdNumber}
   />
```

The optional `plutoCoreBaseUri` parameter allows you to override the relative base url of 
pluto-core from the default value `/pluto-core`. It's not expected to be of any use in the "real world".

## Utilities

### Interceptor

This provides an axios "interceptor" (callback placed in the response chain) which will
automatically attempt to refresh the login token if a "permission denied" is received.

### OAuth2Helper

This provides the code necessary to request a token refresh using a provided "refresh token".

### OAuthConfiguration

This provides the interface prototypes for the json configuration that allows us to contact an oauth provider.
It also provides the 'ti-interface-checker' generated code that allows us to verify correct data shape
at runtime.

### DecodedProfile

This provides the interface prototype for the JWT-based user profile along with a proxy that simplifies
finding data.

### JwtHelpers

This provides utility code that downloads the signing key, verifies the provided key
and decodes the user profile.

# React component library

Since this is a react component library with dependencies such as react and material ui, it is required 
that these are used as peerDependencies, otherwise these would collide with the external applications 
dependencies that is using this react component library.

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
