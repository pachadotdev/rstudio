/* temporary file for testing basic typescript stuff */

const { app } = require('electron');
const { BrowserWindow, session } = require('electron');
const path = require('path');

// Where it all begins
app.whenReady().then(() => {
  console.log('App is ready');

  const win = new BrowserWindow({
    width: 1000,
    height: 750,
    // https://github.com/electron/electron/blob/master/docs/faq.md#the-font-looks-blurry-what-is-this-and-what-can-i-do
    backgroundColor: '#fff', 
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      // preload: path.join(__dirname, '../renderer/preload.js'),
    },
  });

  const indexHTML = path.join(__dirname + '/index.html');
  win.loadFile(indexHTML).then(() => {
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});