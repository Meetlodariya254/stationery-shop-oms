// Electron preload script — exposes safe APIs to the renderer process
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
