# Contributing
You have different ways to contribute to this projects, see how to below.


## Submitting a bug
If you find a bug, you can open an issue (make sure there is not a similar issue already open). Please be the more descriptive as possible:

- What is the bug
- What is the OS and web browser you encounter the bug with
- What is the exact scenario to reproduce the bug


## Adding a default shape
If you had created an interesting shape and you want to make it available as a default shape to everyone who use Yagol, follow these steps:

- Fork this repository
- Install YAGOL locally (see how to on README.md)
- Save your shape as a custom shape
- Decode the shape export string with this [site](https://www.base64decode.org/)
- Save the decoded object in a new key with the same name as your shape in the `public/shapesLibrary.json` file
- Build the app with `npm run build`, then commit your changes (with the builded files)
- Submit a PR


## Adding a color theme
If you want to add a new color theme for YAGOL, follow these steps:

- Fork this repository
- Install YAGOL locally (see how to on README.md)
- Create a new theme with a name in `src/config/colorThemes.js` (create a new one based on an already existing one) and test it
- Build the app with `npm run build`, then commit your changes (with the builded files)
- Submit a PR


## Adding a new feature
If you want to add a new feature, create an issue with the 'enhancement' tag first.
