import uuid4 from "uuid4";
import { mkdir, writeFile } from 'fs/promises';
import directoryTree from "directory-tree";
import path from "path";

const scaffoldFiles = {
    'package.json': JSON.stringify({
        name: 'sandbox',
        private: true,
        version: '0.0.0',
        type: 'module',
        scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
        },
        dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1'
        },
        devDependencies: {
            '@vitejs/plugin-react': '^5.0.4',
            vite: '^8.0.12'
        }
    }, null, 2),
    'index.html': `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sandbox</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/main.jsx"></script>
    </body>
</html>
`,
    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0'
    }
})
`,
    'src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
`,
    'src/App.jsx': `export default function App() {
    return (
        <main className="app-shell">
            <section className="card">
                <p className="eyebrow">React JS sandbox</p>
                <h1>New project created in the container</h1>
                <p>
                    This project is plain React with JavaScript. Run <code>npm install</code>
                    and <code>npm run dev -- --host 0.0.0.0</code> inside the container.
                </p>
            </section>
        </main>
    )
}
`,
    'src/index.css': `:root {
    font-family: Inter, system-ui, sans-serif;
    color: #f4f7fb;
    background: #121521;
}

* {
    box-sizing: border-box;
}

html,
body,
#root {
    margin: 0;
    min-height: 100%;
    width: 100%;
}

body {
    min-height: 100vh;
    background:
        radial-gradient(circle at top left, rgba(104, 74, 255, 0.2), transparent 30%),
        radial-gradient(circle at bottom right, rgba(17, 189, 255, 0.15), transparent 35%),
        #121521;
}

.app-shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
}

.card {
    max-width: 720px;
    width: 100%;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    background: rgba(15, 18, 30, 0.72);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(18px);
}

.eyebrow {
    margin: 0 0 14px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 12px;
    color: #8ab4ff;
}

h1 {
    margin: 0 0 16px;
    font-size: clamp(2rem, 4vw, 4rem);
    line-height: 1.05;
}

p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.7;
    color: rgba(244, 247, 251, 0.82);
}

code {
    padding: 0.16rem 0.4rem;
    border-radius: 0.4rem;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}
`
};

async function writeScaffoldFile(projectRoot, relativePath, content) {
    const filePath = path.join(projectRoot, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, 'utf8');
}

export const createProjectService = async () => {
    const projectId = uuid4();
    console.log(projectId);

        const projectRoot = `./projects/${projectId}/sandbox`;
        await mkdir(projectRoot, { recursive: true });

        for (const [relativePath, content] of Object.entries(scaffoldFiles)) {
                await writeScaffoldFile(projectRoot, relativePath, content);
        }

    return projectId;

}

export const getProgectTreeService = async (projectId)=>{
            const projecPath = path.resolve(`./projects/${projectId}`);
            const tree = directoryTree(projecPath);
            
            return tree
}


