import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      [Key in keyof typeof import('./api')]: (typeof import('./api'))[Key]
    }
  }
}
