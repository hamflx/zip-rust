import JSZip from 'jszip'

document.getElementById('downloadByWasmButton').addEventListener('click', handleZipButtonClick('wasm', zipFilesByWasm))
document.getElementById('downloadByJsButton').addEventListener('click', handleZipButtonClick('js', zipFileByJs))
document.getElementById('benchmarkButton').addEventListener('click', handleBenchmarkButton)

const ZIP_FILE_NAME = 'data-{type}.zip'

function handleZipButtonClick (suffix, fn) {
  return async () => {
    const { ZipArchive } = await import('../pkg')
    const testFiles = await Promise.all(
      [...await getTestFiles()].map(async blob => {
        return {
          filename: blob.name,
          buffer: new Uint8Array(await blob.arrayBuffer())
        }
      })
    )
    download(ZIP_FILE_NAME.replace('{type}', suffix), await measure(() => fn(testFiles, ZipArchive)))
  }
}

async function handleBenchmarkButton () {
  const { ZipArchive } = await import('../pkg')
  const testFiles = await Promise.all(
    [...await getTestFiles()].map(async blob => {
      return {
        filename: blob.name,
        buffer: new Uint8Array(await blob.arrayBuffer())
      }
    })
  )

  download(ZIP_FILE_NAME.replace('{type}', 'js'), await measure('js', () => zipFileByJs(testFiles)))
  download(ZIP_FILE_NAME.replace('{type}', 'wasm'), await measure('wasm', () => zipFilesByWasm(testFiles, ZipArchive)))
}

function zipFilesByWasm (testFiles, ZipArchive) {
  const zip = ZipArchive.new()
  for (let { filename, buffer } of testFiles) {
    zip.add(filename, buffer)
  }
  return zip.finish()
}

function zipFileByJs (testFiles) {
  const zip = new JSZip()
  for (let { filename, buffer } of testFiles) {
    zip.file(filename, buffer)
  }
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } })
}

async function measure (name, fn) {
  const start = Date.now()
  const result = await Promise.resolve(fn())
  console.log(`==> [${name}] elapsed ${((Date.now() - start) / 1000).toFixed(2)}s`)
  return result
}

function getTestFiles () {
  return new Promise((resolve, reject) => {
    const upload = document.createElement('input')
    upload.setAttribute('multiple', 'multiple')
    upload.style.display = 'none'
    upload.type = 'file'
    upload.onchange = () => {
      if (upload.files && upload.files.length) {
        resolve(upload.files)
      }
      upload.remove()
    }
    document.body.appendChild(upload)
    upload.click()
  })
}

function download (filename, buffer) {
  const blob = buffer instanceof Blob ? buffer : new Blob([buffer])

  const anchor = document.createElement('a')
  anchor.style.display = 'none'
  anchor.setAttribute('href', URL.createObjectURL(blob))
  anchor.setAttribute('download', filename)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}
