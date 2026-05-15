/**
 * PostToolUse hook — auto-rebuild when a PNG asset is written.
 *
 * Invoked by .claude/settings.json after every Write tool call.
 * Reads CLAUDE_TOOL_INPUT to check the file path; only rebuilds
 * when the write targets webview-ui/public/assets/*.png.
 *
 * Exits 0 always (hook errors on non-zero would spam the user for
 * every non-PNG write).
 */

'use strict'

const { execSync } = require('child_process')
const path = require('path')

try {
  const raw = process.env.CLAUDE_TOOL_INPUT || '{}'
  const input = JSON.parse(raw)
  const fp = (input.file_path || '').replace(/\\/g, '/')

  if (/webview-ui\/public\/assets\/.*\.png$/.test(fp)) {
    const cwd = path.resolve(__dirname, '..', '..')
    console.log(`[on-png-write] PNG asset changed: ${path.basename(fp)}`)
    console.log('[on-png-write] Running npm run build...')
    const out = execSync('npm run build 2>&1', { cwd, encoding: 'utf8' })
    // Print last 12 lines so the user can see the build result
    const lines = out.trim().split('\n')
    lines.slice(-12).forEach(l => console.log('[build]', l))
    console.log('[on-png-write] Done.')
  }
} catch (e) {
  console.error('[on-png-write] Error:', e.message)
}
// Always exit 0 to avoid noisy hook failures on every non-PNG Write
process.exit(0)
