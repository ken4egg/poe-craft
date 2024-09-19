import { IpcRendererEvent, contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { ApiEvents } from './interface';

export type ApiType = typeof api;

// Custom APIs for renderer
const api = {
  on: <Type extends keyof ApiEvents<IpcRendererEvent>>(
    channel: Type,
    callback: ApiEvents<IpcRendererEvent>[Type],
  ) => {
    return electronAPI.ipcRenderer.on(channel, (event, payload) => callback(event, payload));
  },
  send: <Type extends keyof ApiEvents<IpcRendererEvent>>(
    event: Type,
    payload: Parameters<ApiEvents<IpcRendererEvent>[Type]>[1],
  ) => {
    return electronAPI.ipcRenderer.send(event, payload);
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api;
}
