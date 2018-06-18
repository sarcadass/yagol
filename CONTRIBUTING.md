# Contributing
You have different ways to contribute to this projects, see how to below.


## Submitting a bug
If you find a bug, you can open an issue (make sure there is not a similar issue already open). Please be the more descriptive as possible:

- What is the bug
- What is the OS and web browser you encountered the bug with
- What is the exact scenario to reproduce the bug


## Adding a default shape
If you had created an interesting shape and you want to make it available as a default shape to everyone who use Yagol, follow these steps:

- Fork this repository
- Install Yagol locally (see how to on [README](https://github.com/sarcadass/yagol/blob/master/README.md))
- Save your shape as a custom shape
- Decode the shape export string with this [site](https://www.base64decode.org/)
- Save the decoded object in a new key with the same name as your shape in the `public/shapesLibrary.json` file
- Commit your changes (without the builded files)
- Submit a PR


## Adding a color theme
If you want to add a new color theme for Yagol, follow these steps:

- Fork this repository
- Install Yagol locally (see how to on [README](https://github.com/sarcadass/yagol/blob/master/README.md))
- Create a new color theme with a name in `src/config/colorThemes.js` (copy-paste an existing one and change the color values)
- Commit your changes (without the builded files)
- Submit a PR


## Adding a new feature
If you want to add a new feature, create an issue with the 'enhancement' tag first.
