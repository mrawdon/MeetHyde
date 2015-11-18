# Update:
A new release has been published under the name "v.0.1.1" — it contains some fixes and now main files are linked externally so your code is always up to date without the need to download after every release. If you downloaded a previous release, please go to the [Releases tab](https://github.com/MeetHyde/MeetHyde/releases) to download the last one.

##Changelog:

1. Fixed bug preventing from making changes on organizations repositories.
2. Improved image manager: no need for a predefined images path, the app tracks and lets you manage images on any folder.
3. Main files are now linked externally so your code is always up to date without needing to download every new upgrade.
4. Several minor improvements on the code, the file manager and file editors.

 
# MeetHyde 
###From Content Management Systems to Simple Content Management
MeetHyde provides a simple-to-use web interface to manage content in Jekyll-powered GitHub Pages.

No Jekyll installation or console manipulation is needed.

Use MeetHyde to create and edit posts and pages, manage the images in your repository and use the markdown editor to easily insert them in your pages or posts. 

## Usage
MeetHyde is provided as a downloadable folder that sits on your desktop. To set it up you just need to provide it your Personal Access Token (see instructions below). To use MeetHyde just open `index.html` in your favorite browser (the most up-to-date versions of Chrome or FireFox are recommended) and use the interface to interact with your website files.

By working like this you do not need to maintain a hosted app (free!) or to grant access to your repositories to any application (secure!). All interactions are made through your Personal Access Token which is stored, accessed and managed by you locally.

## How to set up MeetHyde
No formal installation is needed — just follow these steps and start editing your website:

1. **[Download the last release](https://github.com/MeetHyde/MeetHyde/releases) or fork the repo to your desktop.**

    We recommend that you download the latest release from GitHub, so your code will allways be automatically updated. If you want to access and modify the source code, feel free to fork the repo or download the source, but please note that you will need to manually update your code on every release or update.

    To download the latest release please go to the [Releases tab](https://github.com/MeetHyde/MeetHyde/releases).

2. **Create a personal access token.**

    Inside your GitHub Account go to: [Settings/Personal access tokens](https://github.com/settings/tokens). You will see a window like this:
    
    ![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/goto.jpg)

    Click on the "Generate new token" button, give it a description and select the scopes, you can select all or adjust it to your needs:
    
    ![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/set-options.jpg)

    Click "Generate token" and copy the access token:
    
    ![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/copy-token.jpg)
	  

3. **Edit `config.js`.** Copy the downloaded folder to some location in your hard drive, open `config.js` and paste your Access Token in the designated line like this:

    Before:

    ```
    var AccessToken = 'Place_Your_Personal_Access_Token_Here';
    ```

    After:

    ```
    var AccessToken = '3d3eff737f6dac15966da44c09dced4a050942c8';
    ```
   
4. **You are set!** Open `index.html` in your browser and start editing.
