This is fork. See https://github.com/MeetHyde/MeetHyde/ for the master.

This branch is the work of @whaleen developing a front-end development environment for MeetHyde. It is introducing dependency management, sass control over a modularized Bootstrap, a static site generation capability and other nice things listed below.

## MeetHyde Front Stack

- Handlebars HTML templates with Panini
- Sass compilation and prefixing
- JavaScript concatenation
- Built-in BrowserSync server
- For production builds:
  - CSS compression
  - JavaScript compression
  - Image compression

## Installation

To use this, your computer needs:

- [NodeJS](https://nodejs.org/en/) (0.10 or greater)
- [Git](https://git-scm.com/)


### Manual Setup

To manually set up, first download with Git:

```bash
git clone https://github.com/whaleen/MeetHyde
```

Then open the folder in your command line, and install the needed dependencies:

```bash
cd projectname
npm install
bower install
```

Finally, run `npm start` to run Gulp. The finished site will be created in a folder called `dist`, viewable at this URL:

```
http://localhost:8000
```

To create compressed, production-ready assets, run `npm run build`.
