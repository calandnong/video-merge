import { IpcEventType } from '@video-merge/share'
import { ipcRenderer } from 'electron'
import { mergeVideosInParallel } from './video-merge'

/**
 * 选择文件夹
 * @returns
 */
export function selectFolder() {
  return ipcRenderer.invoke(IpcEventType.SELECT_FOlDER)
}

export function mergeVideos(dirs: string[]) {
  console.log(dirs)
  return mergeVideosInParallel([])
}
