const extensionToTypeMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    json: "json",
    md: "markdown",
    mdx: "markdown",
    txt: "plaintext",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    cs: "csharp",
    go: "go",
    rb: "ruby",
    php: "php",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
    yaml: "yaml",
    yml: "yaml",
    png: "plaintext",
    jpg: "plaintext",
    jpeg: "plaintext",
    gif: "plaintext",
    svg: "xml",
    ico: "plaintext",
    env: "plaintext",
    lock: "plaintext",
    sh: "shell",
    bash: "shell",
    Dockerfile: "dockerfile",
    Makefile: "makefile",
    gradle: "gradle",
    gitignore: "plaintext",
    nix: "nix",
    toml: "toml",
    coffee: "coffeescript",
    vue: "vue",
    svelte: "svelte",
    r: "r",
};


export const extensionToFileType = (extension)=>{
    if(!extension) return undefined;
    // normalize input: files may be passed with mixed case
    const key = String(extension).toLowerCase().trim();

    // try direct lookup first (preserve original case keys)
    if (extensionToTypeMap[extension]) return extensionToTypeMap[extension];

    // try lowercase key lookup
    if (extensionToTypeMap[key]) return extensionToTypeMap[key];

    // fallback to plaintext so Monaco doesn't get undefined
    return 'plaintext'
}