import { electronApp, is, optimizer } from '@electron-toolkit/utils';
import { BrowserWindow, app, screen, shell } from 'electron';
import { join } from 'path';
import { UiohookKey, UiohookKeyboardEvent, uIOhook } from 'uiohook-napi';
import icon from '../../resources/icon.png?asset';
import { ApiType } from '../preload';
import { getCurrencyObject } from '../shared/getCurrencyObject';
import { Cords, CraftMod, CraftRule, Currency } from '../shared/interface';
import { BaseCraft, BaseCraftOptions } from './BaseCraft';
import { JsonStorage } from './JsonStorage';
import { MapCraft } from './MapCraft';
import { UtilFlaskCraft } from './UtilFlaskCraft';
import { ipcMainTyped } from './ipcMainTyped';
import { searchReplacerRegex } from './utils';

const config = new JsonStorage({
  configName: 'config',
  defaults: {
    lastName: void 0 as string | undefined,
    rules: [] as {
      name: string;
      rules: CraftRule[];
    }[],
    delay: 500,
    currencyPosition: getCurrencyObject<Cords | null>(null),
    windowBounds: {
      width: 550,
      height: 950,
    },
  },
});

const ClassMap: Record<CraftMod, typeof BaseCraft> = {
  Maps: MapCraft,
  Flasks: UtilFlaskCraft,
};

let craftService: BaseCraft | undefined;
let mainWindow: OverridedBrowserWindow;

type OverridedBrowserWindow = Omit<Electron.BrowserWindow, 'webContents'> & {
  webContents: Omit<Electron.BrowserWindow['webContents'], 'send'> & { send: ApiType['send'] };
};

function createWindow(): void {
  const { height, width } = config.get('windowBounds');
  mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.webContents.on('did-finish-load', () => {
    const lastNameConfig = config.get('lastName');

    if (lastNameConfig) {
      mainWindow.webContents.send('craft:init', { name: lastNameConfig });
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();

    config.set('windowBounds', { height, width });
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  uIOhook.on('keydown', (e) => {
    if (!craftService) {
      return;
    }

    if (e.keycode === 3666 /** INSERT */) {
      if (craftService.state.status === 'IDLE') {
        return craftService.run();
      }

      if (craftService.state.status === 'IN_WORK') {
        return craftService.pause();
      }

      if (craftService.state.status === 'PAUSED') {
        return craftService.resume();
      }
    }
  });

  uIOhook.on('click', (e) => {
    if (e.shiftKey === true && craftService?.state.status === 'IDLE') {
      const cords = { x: e.x, y: e.y };
      craftService.addCraftCords(cords);
    }
  });
}

// app.commandLine.appendSwitch('enable-transparent-visuals');
// app.disableHardwareAcceleration();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  uIOhook.start();

  let keyBindingCbArray: {
    data: { currency: Currency; key: string };
    cb: (e: UiohookKeyboardEvent) => void;
  }[] = [];

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC
  ipcMainTyped.on('craft:init', (_event, { name }) => {
    config.set('lastName', name);
    mainWindow.webContents.send('craft:init', { name });

    const defaultCraftRules = config.get('rules').find((item) => item.name === name) ?? {
      name,
      rules: [],
    };

    const logger: BaseCraftOptions['logger'] = (obj) => {
      mainWindow.webContents.send('log:message', obj);
    };

    craftService = new ClassMap[name]({
      logger,
      currencyPosition: config.get('currencyPosition'),
      delay: config.get('delay'),
    });

    if (craftService) {
      mainWindow.webContents.send('craft:pref-suf-update', {
        prefixes: craftService.prefixes.map((item) => item.replace(searchReplacerRegex, '#')),
        suffixes: craftService.suffixes.map((item) => item.replace(searchReplacerRegex, '#')),
      });
    }

    mainWindow.webContents.send('settings:change:rules', defaultCraftRules);
    craftService?.setCraftRules(defaultCraftRules);

    mainWindow.webContents.send('settings:change:delay', config.get('delay'));

    mainWindow.webContents.send('settings:change:currency', config.get('currencyPosition'));

    craftService?.on('state:update', (state) => {
      mainWindow.webContents.send('state:update', state);
    });

    craftService?.on('craft:update', (payload) => {
      mainWindow.webContents.send('craft:update', payload);
    });

    craftService?.on('rules:update', (payload) => {
      mainWindow.webContents.send('settings:change:rules', payload);
    });

    craftService?.on('currency:position:set', (payload) => {
      mainWindow.webContents.send('settings:change:currency', payload);
      config.set('currencyPosition', payload);
    });

    logger?.({ message: config.getConfigPath(), type: 'INFO', label: `Загружен конфиг ${name}` });
  });

  ipcMainTyped.on('settings:change:delay', (_event, delay) => {
    config.set('delay', delay);
    craftService?.setDelay(delay);
  });

  ipcMainTyped.on('settings:change:rules', (_event, rules) => {
    craftService?.setCraftRules(rules);

    const currentRules = config.get('rules');

    const newRules = [...currentRules.filter((item) => item.name !== rules.name), rules];

    config.set('rules', newRules);
  });

  ipcMainTyped.on('currency:listener:on', (_event, payload) => {
    keyBindingCbArray.forEach((item) => {
      uIOhook.off('keydown', item.cb);
    });

    keyBindingCbArray = [];

    payload.forEach((item) => {
      const cb = (e: UiohookKeyboardEvent) => {
        if (e.shiftKey && e.keycode === UiohookKey[item.key]) {
          const point = screen.getCursorScreenPoint();
          const cords = { x: point.x, y: point.y };

          craftService?.setCurrencyPosition(item.currency, cords);
        }
      };

      uIOhook.on('keydown', cb);
      keyBindingCbArray.push({ data: item, cb });
    });
  });

  setTimeout(() => createWindow(), 500);

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
