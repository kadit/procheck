var app = require('app');
var BrowserWindow = require('browser-window');
var Tray = require('electron').Tray;
var Menu = require('electron').Menu;

var mainWindow = null;
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});



app.on('ready', function() {
  var tray = new Tray('./img/images.png');

  mainWindow = new BrowserWindow({
    width: 500, 
    height: 500, 
    frame: false, 
    x:1100, 
    y:500,
    icon:'./img/images.png'
  });
  //mainWindow = new BrowserWindow();
  mainWindow.setMenu(null);
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  
  var contextMenu = Menu.buildFromTemplate([

        { 
          label: 'Show App', 
          click:  function(){
            mainWindow.show();
          } 
        },
        { 
            label: 'Quit', 
            click:  function(){
              app.isQuiting = true;
              app.quit();
            } 
        }
    ]);
  tray.setToolTip('Pro Check');
  tray.setContextMenu(contextMenu);
  
});
