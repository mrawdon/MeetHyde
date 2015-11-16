# Update:
A new release have been published under the name "v.0.1.1", it contains some fixes and now main files are linked externally so your code is always up to date without needing to download every new upgrade. So if you downloaded the previous release you Really should go to the "releases" tab to download the last one or simply follow this link: 

##Changelog:

 1. Fixed bug preventing from making changes on organizations repositories.
 2. Improved image manager, now you don't need to set a predefined images path, the app tracks and lets you manage images on any folder.
 3. Several minor improvements on the code, the file manager and file editors.

 
# Meet Hyde 
###From Content Management Systems to Simple Content Management
Meet Hyde provides a simple to use web interface to manage content in Jekyll powered GitHub Pages.

No Jekyll installation or console manipulation is needed.

Use Meet Hyde to create and edit posts and pages, manage the images in your repository and use the markdown editor to easily insert them in yor pages or posts content. 

## Usage
MeetHyde is provided as a downloadable folder that sits on your desktop you just need to provide it your Personal Access Token, open the index.html file in your favorite browser (last version of Chrome or FireFox is recommended), and use the interface to interact with your website files.

It is provided this way so no hosted app needs to be maintained and so you don't need to grant any application with access to your repositories, all interactions are made through your Personal Access Token which is totally managed by you, saved and accessed through a file on your desktop.

No installations are needed, just follow these steps and start editing your website:

1.- Download the last release or fork the repo to your desktop.
  It's recommended you work with the release so your code will allways be automatically updated. Fork the repo or download the source only if you want to access and modify the source code (please note with this option you will need to manually update your code on every release or upgrade).

To download the latest release please go to the releases tab or follow this link: [MeetHyde last release](https://github.com/MeetHyde/MeetHyde/releases)

2.- Create a personal access token:
	
 Inside your GitHub Account go to: [Settings/Personal access tokens](https://github.com/settings/tokens), you'll see a window like this:
	  
![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/goto.jpg)

	  
 Click on the "Genetare new token" button, give it a description and select the scopes, you can select all or adjust it to your needs:
 
 ![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/set-options.jpg)
	  
Click "Generate token" and copy the access token:

 ![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/copy-token.jpg)
	  

3.- Finally in your downloaded folder open the "config.js" file and paste your Access Token in the designated line like this:

Before:

    var AccessToken = 'Place_Your_Personal_Access_Token_Here';
After:

    var AccessToken = '3d3eff737f6dac15966da44c09dced4a050942c8';

   
 4.- Open index.html in your browser and start editing.
