import { spawn } from "node:child_process"
import { rm, readFile, unlink, writeFile } from "node:fs/promises"
import net from "node:net"
import path from "node:path"
import process from "node:process"

const root = process.cwd()
const port = Number(process.env.PORT || 3000)
const lockPath = path.join(root, ".prepskul-dev.lock")
const distDir = process.env.NEXT_DIST_DIR || ".next-dev"

async function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false

  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    // EPERM means the process exists but this shell cannot signal it.
    return error?.code === "EPERM"
  }
}

async function claimDevLock() {
  try {
    const existingPid = Number((await readFile(lockPath, "utf8")).trim())
    if (await processIsAlive(existingPid)) {
      console.error(`\nPrepSkul dev server is already running (PID ${existingPid}).`)
      console.error("Stop it with Ctrl+C before starting another server.\n")
      process.exit(1)
    }
    await unlink(lockPath)
  } catch (error) {
    if (error?.code !== "ENOENT") throw error
  }

  await writeFile(lockPath, String(process.pid), "utf8")
}

function assertPortIsFree() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use. Stop the existing server before running pnpm dev again.`))
        return
      }
      reject(error)
    })
    probe.listen({ host: "0.0.0.0", port }, () => probe.close(resolve))
  })
}

async function releaseDevLock() {
  try {
    const owner = (await readFile(lockPath, "utf8")).trim()
    if (owner === String(process.pid)) await unlink(lockPath)
  } catch (error) {
    if (error?.code !== "ENOENT") console.error(error)
  }
}

await claimDevLock()

try {
  await assertPortIsFree()
  await rm(path.join(root, distDir), { recursive: true, force: true })
} catch (error) {
  console.error(`\n${error.message}\n`)
  await releaseDevLock()
  process.exit(1)
}

console.log(`Starting PrepSkul on http://localhost:${port}`)
console.log(`Fresh development output: ${distDir}\n`)

const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next")
const child = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
  cwd: root,
  env: { ...process.env, NEXT_DIST_DIR: distDir },
  stdio: "inherit",
})

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal))
}

child.once("exit", async (code, signal) => {
  await releaseDevLock()
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 0)
})
