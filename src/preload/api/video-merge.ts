import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { spawn } from 'child_process'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
ffmpeg.setFfmpegPath(ffmpegPath)

async function mergeVideos(videos, output) {
  // 将视频文件列表转换为FFmpeg命令行参数
  const args = ['-y']
  for (let i = 0; i < videos.length; i++) {
    args.push('-i', videos[i])
  }
  args.push(
    '-filter_complex',
    `concat=n=${videos.length}:v=1:a=1`,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ac',
    '2',
    output
  )

  // 调用二进制FFmpeg进行合并
  const ffmpeg = spawn(ffmpegPath, args)
  ffmpeg.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })
  ffmpeg.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })
  return new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve('')
      } else {
        reject(`child process exited with code ${code}`)
      }
    })
  })
}

// 示例用法
// const videosArray = [
//   ['A.mp4', 'B.mp4', 'C.mp4'],
//   ['A.mp4', 'B.mp4', 'C.mp4', 'D.mp4'],
//   // 添加更多子数组
// ];
// mergeVideosInParallel(videosArray)
//   .then(() => {
//     console.log('所有视频合并完成');
//   })
//   .catch((error) => {
//     console.error('部分视频合并失败', error);
//   });
export async function mergeVideosInParallel(videosArray: string[][]) {
  if (isMainThread) {
    // 主线程
    const workers: Worker[] = []
    videosArray.forEach((videos, index) => {
      const output = `output${index + 1}.mp4`
      const worker = new Worker(new URL(import.meta.url), { workerData: { videos, output } })
      worker.on('message', (msg) => {
        if (msg.status === 'success') {
          console.log(`视频${msg.index}合并完成`)
        } else {
          console.error(`视频${msg.index}合并失败`, msg.error)
        }
      })
      worker.on('error', (error) => {
        console.error('Worker error:', error)
      })
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`)
        }
      })
      workers.push(worker)
    })
    return Promise.all(
      workers.map((worker) => new Promise((resolve) => worker.on('exit', resolve)))
    )
  } else {
    // 工作线程
    try {
      await mergeVideos(workerData.videos, workerData.output)
      parentPort?.postMessage({
        status: 'success',
        index: parseInt(workerData.output.slice(6, -4))
      })
      return
    } catch (error) {
      parentPort?.postMessage({
        status: 'error',
        index: parseInt(workerData.output.slice(6, -4)),
        error
      })
      return
    }
  }
}
