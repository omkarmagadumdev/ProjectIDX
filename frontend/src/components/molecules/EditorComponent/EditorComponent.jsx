import React, { useEffect, useRef, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { useActiveFileTabStore } from '../../../store/useActiveFileTabStore'
import { extensionToFileType } from '../../../utils/extensionToFileType'
import { useEditorSocketStore } from '../../../store/useEditorSocketStore'
import draculaTheme from '../../../../Dracula.json'

function getLanguageForTab(tab) {
  const extFromPath = tab?.path ? String(tab.path).split('/').pop().split('.').pop() : undefined
  const computedExt = tab?.extension || (extFromPath ? extFromPath.toLowerCase() : undefined)
  return extensionToFileType(computedExt)
}

const tabButtonStyle = {
  border: 'none',
  borderRight: '1px solid rgba(255,255,255,0.08)',
  background: 'transparent',
  color: '#d8dee9',
  cursor: 'pointer',
  padding: '10px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: 0,
  maxWidth: '220px',
}

const EditorComponent = () => {
  const saveTimerRef = useRef(null)
  const editorInstanceRef = useRef(null)
  const editorContainerRef = useRef(null)
  const [editorValue, setEditorValue] = useState('//welcome to playground')

  const {
    tabs,
    activeTabPath,
    activateTab,
    closeTab,
    updateActiveTabContent,
    getActiveFileTab,
  } = useActiveFileTabStore()

  const activeFileTab = getActiveFileTab()
  const { editorSocket } = useEditorSocketStore()

  useEffect(() => {
    setEditorValue(activeFileTab?.value ?? '//welcome to playground')
  }, [activeFileTab?.path, activeFileTab?.value])

  function handleChange(value) {
    const latestValue = value ?? ''
    const pathForSave = activeFileTab?.path

    setEditorValue(latestValue)
    updateActiveTabContent(latestValue)

    if (saveTimerRef.current != null) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      if (!editorSocket?.emit || !pathForSave) {
        console.warn('EditorComponent: cannot save file yet', {
          hasSocket: !!editorSocket,
          path: pathForSave,
        })
        return
      }

      editorSocket.emit('writeFile', {
        pathToFileOrFolder: pathForSave,
        data: latestValue,
      })
    }, 600)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current != null) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!editorContainerRef.current) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      try {
        editorInstanceRef.current?.layout()
      } catch (e) {}
    })

    resizeObserver.observe(editorContainerRef.current)

    return () => {
      try {
        resizeObserver.disconnect()
      } catch (e) {}
    }
  }, [])

  function handleOnMount(editor, monaco) {
    editorInstanceRef.current = editor
    try {
      monaco.editor.defineTheme('Dracula', draculaTheme)
      monaco.editor.setTheme('Dracula')
    } catch (e) {
      console.warn('EditorComponent: failed to apply theme', e)
    }
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          minHeight: '44px',
          overflowX: 'auto',
          backgroundColor: '#232530',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {tabs.length ? (
          tabs.map((tab) => {
            const isActive = tab.path === activeTabPath

            return (
              <div
                key={tab.path}
                style={{
                  ...tabButtonStyle,
                  backgroundColor: isActive ? '#2d3142' : 'transparent',
                  color: isActive ? '#ffffff' : '#b7bfd4',
                }}
              >
                <button
                  type="button"
                  onClick={() => activateTab(tab.path)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {tab.title}
                </button>
                <button
                  type="button"
                  aria-label={`Close ${tab.title}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    closeTab(tab.path)
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    fontSize: '14px',
                    opacity: 0.8,
                    cursor: 'pointer',
                  }}
                >
                  x
                </button>
              </div>
            )
          })
        ) : null}
      </div>

      <div
        ref={editorContainerRef}
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <Editor
          key={activeFileTab?.path || 'empty-editor'}
          height="100%"
          width="100%"
          defaultValue="// Welcome to the playground"
          onMount={handleOnMount}
          beforeMount={(monaco) => {
            try {
              monaco.editor.defineTheme('Dracula', draculaTheme)
            } catch (e) {
              console.warn('EditorComponent: failed to predefine theme', e)
            }
          }}
          theme="Dracula"
          path={activeFileTab?.path || 'untitled.txt'}
          options={{
            automaticLayout: true,
            fontSize: 18,
            fontFamily: 'Fira Code, monospace',
            minimap: { enabled: false },
          }}
          language={getLanguageForTab(activeFileTab)}
          onChange={handleChange}
          value={editorValue}
        />
      </div>
    </div>
  )
}

export default EditorComponent
