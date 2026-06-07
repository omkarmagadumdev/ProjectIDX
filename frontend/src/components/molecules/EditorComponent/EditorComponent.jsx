import React, { useEffect, useRef } from 'react'
import { Editor } from '@monaco-editor/react'
import { useActiveFileTabStore } from '../../../store/useActiveFileTabStore';
import { extensionToFileType } from '../../../utils/extensionToFileType';
import { useEditorSocketStore } from '../../../store/useEditorSocketStore';
import draculaTheme from '../../../../Dracula.json'

const EditorComponent = () => {
  const saveTimerRef = useRef(null)

  const { activeFileTab } = useActiveFileTabStore()

  const { editorSocket } = useEditorSocketStore()

  useEffect(() => {
    console.log('EditorComponent: activeFileTab ->', activeFileTab)
    const extFromPath = activeFileTab?.path ? String(activeFileTab.path).split('/').pop().split('.').pop() : undefined
    const computedExt = activeFileTab?.extension || (extFromPath ? extFromPath.toLowerCase() : undefined)
    const computedLanguage = extensionToFileType(computedExt)
    console.log('EditorComponent: computed extension ->', computedExt)
    console.log('EditorComponent: computed language ->', computedLanguage)
  }, [activeFileTab])

  function handleChnage (value){
    if(saveTimerRef.current != null){
      clearTimeout(saveTimerRef.current)
    }
      saveTimerRef.current = setTimeout(()=>{
        if (!editorSocket?.emit || !activeFileTab?.path) {
          console.warn('EditorComponent: cannot save file yet', {
            hasSocket: !!editorSocket,
            path: activeFileTab?.path,
          })
          return
        }

        editorSocket.emit("writeFile",{
          pathToFileOrFolder:activeFileTab.path,
          data:value ?? ''
        })
      },2000)
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current != null) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  function handleOnMount (editor,monaco){
    try{
      monaco.editor.defineTheme('Dracula', draculaTheme);
      monaco.editor.setTheme('Dracula');
    }catch(e){
      console.warn('EditorComponent: failed to apply theme', e)
    }
  }

  return ( 
    <>
      <Editor 
        height={'75vh'}
        width={'100%'}
        defaultValue='// Weclocme to the playground'
        onMount={handleOnMount}
        beforeMount={(monaco) => {
          try {
            monaco.editor.defineTheme('Dracula', draculaTheme);
          } catch (e) {
            console.warn('EditorComponent: failed to predefine theme', e)
          }
        }}
        theme="Dracula"
        options={{
            fontSize: 18,
          fontFamily: "Fira Code, monospace"
            
        }}
        language={(() => {
          const extFromPath = activeFileTab?.path ? String(activeFileTab.path).split('/').pop().split('.').pop() : undefined
          const computedExt = activeFileTab?.extension || (extFromPath ? extFromPath.toLowerCase() : undefined)
          return extensionToFileType(computedExt)
        })()}
        onChange={handleChnage}
        value={ activeFileTab?.value ? activeFileTab.value : '//welcome to playground' }

      />
    </>
  )
}


export default EditorComponent