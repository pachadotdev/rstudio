
import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow() {
  // Create the browser window.
  const tmpPath = __dirname;
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../renderer/preload.js"),
    },
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../../src/renderer/index.html"));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


/* temporary file for testing basic typescript stuff */

// const { app } = require('electron');
// const { BrowserWindow, session } = require('electron');
// const path = require('path');

// // Where it all begins
// app.whenReady().then(() => {
//   console.log('App is ready');

//   const win = new BrowserWindow({
//     width: 1000,
//     height: 750,
//     // https://github.com/electron/electron/blob/master/docs/faq.md#the-font-looks-blurry-what-is-this-and-what-can-i-do
//     backgroundColor: '#fff', 
//     webPreferences: {
//       enableRemoteModule: false,
//       nodeIntegration: false,
//       contextIsolation: true,
//       // preload: path.join(__dirname, '../renderer/preload.js'),
//     },
//   });

//   const indexHTML = path.join(__dirname + '/index.html');
//   win.loadFile(indexHTML).then(() => {
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });