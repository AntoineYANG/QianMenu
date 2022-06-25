/*
 * @Author: Kanata You 
 * @Date: 2022-04-18 23:52:22 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-25 20:00:46
 */
'use strict';

const path = require('path');
const {
  app,
  BrowserWindow,
  nativeTheme,
} = require('electron');
const PACKAGE_NAME = '菜单生成工具';

const DEFAULT_WINDOW_WIDTH = 1140;
const DEFAULT_WINDOW_HEIGHT = 740;

/**
 * @returns {Promise<number>}
 */
const createWindow = () => {
  const win = new BrowserWindow({
    minWidth: DEFAULT_WINDOW_WIDTH,
    minHeight: DEFAULT_WINDOW_HEIGHT,
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    autoHideMenuBar: false,
    center: true,
    transparent: false,
    darkTheme: nativeTheme.shouldUseDarkColors,
    frame: true,
    fullscreen: false,
    fullscreenable: true,
    hasShadow: true,
    resizable: true,
    title: PACKAGE_NAME,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  return new Promise((resolve, _reject) => {
    const H5_ENTRY = path.join(
      __dirname,
      '..',
      'index.html'
    );

    win.loadFile(H5_ENTRY);

    // macOS apps generally continue running even without any windows open,
    // and activating the app when no windows are available should open a new one.
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        const H5_ENTRY = path.join(
          __dirname,
          '..',
          'index.html'
        );

        win.loadFile(H5_ENTRY);
      }
    });

    // end of lifecycle
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
        resolve(0);
      }
    });
  });
};

/**
 * @param {string | undefined} [url]
 * @returns {Promise<number>}
 */
const main = async (url) => {
  // In Electron, browser windows can only be created
  // after the app module's ready event is fired
  await app.whenReady();

  const returnCode = await createWindow(url);

  return returnCode;
};


if (require.main === module) {
  main().then(process.exit);
}


module.exports = main;
