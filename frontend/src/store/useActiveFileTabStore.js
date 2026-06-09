import { create } from 'zustand'

function getFileNameFromPath(path) {
    if (!path) return 'Untitled'
    const normalized = String(path)
    const segments = normalized.split('/')
    return segments[segments.length - 1] || normalized
}

function normalizeTab(tab) {
    return {
        path: tab.path,
        value: tab.value ?? '',
        extension: tab.extension,
        title: tab.title || getFileNameFromPath(tab.path),
    }
}

export const useActiveFileTabStore = create((set, get) => ({
    tabs: [],
    activeTabPath: null,

    openFileTab: ({ path, value = '', extension }) => {
        if (!path) return

        set((state) => {
            const normalizedTab = normalizeTab({ path, value, extension })
            const existingIndex = state.tabs.findIndex((tab) => tab.path === path)

            if (existingIndex === -1) {
                return {
                    tabs: [...state.tabs, normalizedTab],
                    activeTabPath: path,
                }
            }

            const nextTabs = state.tabs.map((tab, index) =>
                index === existingIndex
                    ? {
                        ...tab,
                        ...normalizedTab,
                        value: value ?? tab.value,
                    }
                    : tab
            )

            return {
                tabs: nextTabs,
                activeTabPath: path,
            }
        })
    },

    setActiveFileTab: (value, path, extension) => {
        get().openFileTab({ path, value, extension })
    },

    activateTab: (path) => {
        if (!path) return
        set((state) => ({
            activeTabPath: state.tabs.some((tab) => tab.path === path)
                ? path
                : state.activeTabPath
        }))
    },

    updateActiveTabContent: (value) => {
        const activeTabPath = get().activeTabPath
        if (!activeTabPath) return
        get().updateTabContent(activeTabPath, value)
    },

    updateTabContent: (path, value) => {
        if (!path) return
        set((state) => ({
            tabs: state.tabs.map((tab) =>
                tab.path === path
                    ? {
                        ...tab,
                        value: value ?? '',
                    }
                    : tab
            )
        }))
    },

    closeTab: (path) => {
        if (!path) return

        set((state) => {
            const currentIndex = state.tabs.findIndex((tab) => tab.path === path)
            if (currentIndex === -1) {
                return state
            }

            const nextTabs = state.tabs.filter((tab) => tab.path !== path)
            let nextActiveTabPath = state.activeTabPath

            if (state.activeTabPath === path) {
                const fallbackTab = nextTabs[currentIndex] || nextTabs[currentIndex - 1] || null
                nextActiveTabPath = fallbackTab?.path ?? null
            }

            return {
                tabs: nextTabs,
                activeTabPath: nextActiveTabPath,
            }
        })
    },

    closeTabsUnderPath: (folderPath) => {
        if (!folderPath) return

        set((state) => {
            const prefix = `${folderPath}/`
            const nextTabs = state.tabs.filter(
                (tab) => tab.path !== folderPath && !tab.path.startsWith(prefix)
            )

            const activeTabStillExists = nextTabs.some((tab) => tab.path === state.activeTabPath)

            return {
                tabs: nextTabs,
                activeTabPath: activeTabStillExists ? state.activeTabPath : nextTabs[nextTabs.length - 1]?.path ?? null,
            }
        })
    },

    renameTab: (oldPath, newPath) => {
        if (!oldPath || !newPath) return

        set((state) => {
            const oldPrefix = `${oldPath}/`
            const nextTabs = state.tabs.map((tab) =>
                tab.path === oldPath || tab.path.startsWith(oldPrefix)
                    ? (() => {
                        const replacedPath = tab.path === oldPath
                            ? newPath
                            : tab.path.replace(oldPrefix, `${newPath}/`)

                        return {
                            ...tab,
                            path: replacedPath,
                            title: getFileNameFromPath(replacedPath),
                        }
                    })()
                    : tab
            )

            return {
                tabs: nextTabs,
                activeTabPath:
                    state.activeTabPath === oldPath
                        ? newPath
                        : state.activeTabPath?.startsWith(oldPrefix)
                            ? state.activeTabPath.replace(oldPrefix, `${newPath}/`)
                            : state.activeTabPath,
            }
        })
    },

    getActiveFileTab: () => {
        const { tabs, activeTabPath } = get()
        return tabs.find((tab) => tab.path === activeTabPath) || null
    }
}))
