import { IpcMainEvent, ipcMain } from 'electron';
import { ApiEvents } from '../preload/interface';

export const ipcMainTyped = {
  on: <Type extends keyof ApiEvents<IpcMainEvent>>(
    channel: Type,
    callback: ApiEvents<IpcMainEvent>[Type],
  ) => {
    return ipcMain.on(channel, (event, payload) => callback(event, payload));
  },
};
