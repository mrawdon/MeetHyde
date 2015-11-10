# Meet Hyde
Meet Hyde provides a simple web interface to manage content in Jekyll powered Github Pages.

Use Meet Hyde to create and edit posts and pages, manage the images in your repository and use the markdown editor to easily insert them in yor pages or posts content.

## Usage

No installations are needed, just follow these steps and start editing your website:

1.- Download the files or fork the repo to your desktop.
  To download the latest release please go to the releases tab or follow this link: [MeetHyde last release](https://github.com/MeetHyde/MeetHyde/releases)

2.- Create a personal access token:
	
 Inside your Account go to: [Settings/Personal access tokens](https://github.com/settings/tokens)
	  
![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/goto.jpg)

	  
 Click on Genetare new token, give it a description and select the scopes, you can select all or adjust it to your needs:
 
 ![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/set-options.jpg)
	  
Click "Generate token" and copy the access token:

 ![](https://raw.githubusercontent.com/MeetHyde/meethyde.github.io/master/assets/images/docs/copy-token.jpg)
	  

3.- Finally in your downloaded folder open "js/config.js":
   
Paste your token in the indicated option.
	   
 Set the path to your images folder, this path will be used to upload images and link them to your documents.
 
 4.- Open index.html in your browser and start editing.
