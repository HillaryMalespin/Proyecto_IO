import { spawnSync } from 'node:child_process'

const candidatos = ['python3', 'python', 'py']
const py = candidatos.find(
  (c) => spawnSync(c, ['--version'], { stdio: 'ignore' }).status === 0
)
if (!py) {
  console.error('No se encontró Python 3.12+ en el PATH.')
  process.exit(1)
}
const r = spawnSync(py, process.argv.slice(2), { stdio: 'inherit' })
process.exit(r.status ?? 1)