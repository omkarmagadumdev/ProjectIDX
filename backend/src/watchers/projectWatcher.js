import fs from 'fs'
import path from 'path'

export function startProjectWatcher(editorNamespace) {
  try {
    const projectsRoot = path.resolve('./projects');
    if (!fs.existsSync(projectsRoot)) return;

    const lastEmit = new Map();

    const handleChange = (relativePath) => {
      if (!relativePath) return;
      const parts = relativePath.split(path.sep).filter(Boolean);
      const projectId = parts[0];
      if (!projectId) return;

      const now = Date.now();
      const prev = lastEmit.get(projectId) || 0;
      if (now - prev < 500) return; // throttle frequent events
      lastEmit.set(projectId, now);

      try {
        if (editorNamespace) {
          editorNamespace.to(projectId).emit('projectTreeUpdated', { projectId });
        }
      } catch (e) {
        console.warn('projectWatcher: emit failed', e);
      }
    }

    // watch recursively; on many platforms recursive works for directories
    try {
      fs.watch(projectsRoot, { recursive: true }, (eventType, filename) => {
        handleChange(filename);
      });
    } catch (e) {
      console.warn('projectWatcher: fs.watch failed, falling back to polling', e);
      // fallback: poll every 1s and detect changes by mtime (simple implementation)
      const snapshot = new Map();
      const scan = (dir) => {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              scan(full);
            } else {
              try {
                const s = fs.statSync(full).mtimeMs;
                const prev = snapshot.get(full) || 0;
                if (s !== prev) {
                  snapshot.set(full, s);
                  const rel = path.relative(projectsRoot, full);
                  handleChange(rel);
                }
              } catch (e) {}
            }
          }
        } catch (e) {}
      }
      setInterval(() => scan(projectsRoot), 1000);
    }
  } catch (err) {
    console.warn('startProjectWatcher failed', err);
  }
}

export default startProjectWatcher;
