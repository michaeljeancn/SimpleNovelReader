const { app, BrowserWindow, Menu } = require('electron');
const template = [{
    label: '书籍',
    submenu: [{
        label: '新建书籍',
        accelerator: 'CmdOrCtrl+N',
        role: 'new',
        click: function() {
            showHideControl('query');
        }
    }, {
        label: '下载书籍',
        accelerator: 'CmdOrCtrl+D',
        role: 'open',
        click: function() {
            clickBtn('downloadChapters');
        }
    }, {
        type: 'separator'
    }, {
        label: '关闭',
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
    }]
}, {
    label: '帮助',
    role: 'help',
    submenu: [{
        label: `版本 ${app.getVersion()}`,
        role: 'about'
    }]
}];
const menu = Menu.buildFromTemplate(template);
let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

Menu.setApplicationMenu(menu);

function showHideControl(id) {
    mainWindow.webContents.getElementById(id).setAttribute('style', 'display:inline');
}

function clickBtn(id) {
    mainWindow.webContents.getElementById(id).onclick();
}