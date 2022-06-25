/*
 * @Author: Kanata You 
 * @Date: 2022-04-20 14:45:15 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-06-25 20:09:09
 */
'use strict';

const path = require('path');
const fs = require('fs');
const packager = require('electron-packager');
const {
  author = 'kyusho',
  productName = '菜单生成工具',
  version,
  dependencies,
  devDependencies,
} = require('../package.json');


/**
 * @returns {Promise<number>}
 * @see https://electron.github.io/electron-packager/main/interfaces/electronpackager.options.html
 */
const bundleElectronApp = async () => {
  const entryDir = path.join(__dirname, '..', 'build');
  const entryFile = path.join(__dirname, 'utils', 'electron.js');

  if (!fs.existsSync(entryDir)) {
    console.error(
      `Cannot find dir "${entryDir}", maybe you need to build React app first.`
    );

    return 1;
  }

  const targetDir = path.join(__dirname, '..', 'output');

  const packageData = {
    name: productName,
    author,
    version,
    main: './electron/main.js',
    dependencies,
    devDependencies
  };

  const tmpDir = path.join(entryDir, 'electron');

  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { force: true, recursive: true });
  }
  
  fs.mkdirSync(tmpDir);
  
  const tmpEntry = path.join(tmpDir, 'main.js');
  const tmpPkgJSON = path.join(entryDir, 'package.json');

  fs.copyFileSync(entryFile, tmpEntry);
  fs.writeFileSync(
    tmpPkgJSON,
    JSON.stringify(packageData, undefined, 2) + '\n',
    {
      encoding: 'utf-8'
    }
  );

  const appPaths = await packager({
    name: productName,
    appVersion: `${version}`,
    appBundleId: `bundle-${version}`,
    buildVersion: `${version}`,
    dir: entryDir,
    electronZipDir: path.join(__dirname, '..', 'electron-cache'),
    executableName: productName,
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    ignore: ['.espoir'],
    out: targetDir,
    overwrite: true,
    platform: ['win32'],
    tmpdir: path.join(__dirname, '..', 'output-tmp'),
    win32metadata: {
      CompanyName: author.split(/ +/)[0],
      FileDescription: productName,
      InternalName: productName,
      ProductName: productName,
    },
    appCategoryType: 'public.app-category.education',
    darwinDarkModeSupport: true,
  });
  
  console.log(`Electron app bundles created:\n${appPaths.join('\n')}`);

  console.log('Remove temporary files');

  fs.rmSync(tmpPkgJSON);
  fs.rmSync(tmpDir, { force: true, recursive: true });

  return 0;
};


if (module === require.main) {
  bundleElectronApp().then(process.exit);
}
