const electron = require('electron');
const url = require('url');
const path = require('path');

const  {app, BrowserWindow, Menu, ipcMain} = electron;


// SET ENV to Production. Comment out to be in Dev environment
// process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function() {
    // Create new Window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
          }
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create Add Window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title:'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
          }
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection Handle
    addWindow.on('close', function(){
        addWindow = null;
    });
}

//Catch item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label:'File', 
        submenu:[
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label:'About',
        submenu:[
            {
                label:'Website'
            },
            {
                label:'Version'
            }
        ]
    }

];

// If Mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
};

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
};