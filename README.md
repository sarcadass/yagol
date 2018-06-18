# Yagol

Yet Another Game Of Life. Yagol is a Conway's Game of Life sandbox made with ReactJs. Customize the different options then create, share and watch your shapes evolve.
This app was created with the excellent [create-react-app](https://github.com/facebook/create-react-app).

![Yagol Intro Animation](https://media.giphy.com/media/QfHUF4DU6HB9erASmv/giphy.gif "Yagol Intro Animation")

**See the [app site](http://sarcadass.github.io/yagol)**.


## Installing Yagol locally

- Clone this repo
- In the folder you cloned the repo run `npm install`
- Launch the local server (with hot js/css reloading) with `npm start` (note that it will be less performant than the builded version, see how to use the builded version below)

## Build the project and use it locally

- Install yagol locally (see above)
- Run `npm build`
- You will have to use a local web server and set `build/` as your root folder to run Yagol if you want to use the default shapes
- To do that you can use [http-server](https://github.com/indexzero/http-server). install it globally (`npm install http-server -g`) then set `build/` as your current working directory (`cd build`) then run `http-server`. The URL where you can access Yagol should be written in your terminal


## Dependencies

- [react-modal](https://github.com/reactjs/react-modal)
- [react-notification-system](https://github.com/igorprado/react-notification-system)
- [react-svg-loader](https://github.com/boopathi/react-svg-loader/tree/master/packages/react-svg-loader)
