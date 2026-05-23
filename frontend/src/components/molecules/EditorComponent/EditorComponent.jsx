import React, { useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { theme } from 'antd';
import { EditorButton } from '../../atoms/EditorButton/EditorButton';
import { useActiveFileTabStore } from '../../../store/useActiveFileTabStore';
import { extensionToFileType } from '../../../utils/extensionToFileType';
import { useEditorSocketStore } from '../../../store/useEditorSocketStore';

const EditorComponent = () => {
  
  let timerId = null;
  const [editorState, setEditorState] = useState({
    theme:null
  });

  const { activeFileTab } = useActiveFileTabStore()

  const { editorSocket } = useEditorSocketStore()

  async function downloadTheme(){
    const response = await fetch("/Dracula.json");
    const data = await  response.json();
    setEditorState(prev => ({...prev,theme:data}))
  }

  function handleChnage (value){
    if(timerId != null){
      clearTimeout(timerId)
    }
      timerId = setTimeout(()=>{
        const editorContent = value
          editorSocket.emit("writeFile",{
            pathToFileOrFolder:activeFileTab.path,
            value:editorContent
          })
      },2000)
  }

  useEffect(()=>{
      downloadTheme()
  },[])

  function handleOnMount (editor,monaco){
    if(editorState.theme) {
      try{
        monaco.editor.defineTheme('Dracula', editorState.theme);
        monaco.editor.setTheme('Dracula');
      }catch(e){
        console.warn('EditorComponent: failed to apply theme', e)
      }
    }
  }

  return ( 
    <>
      {editorState.theme && <Editor 
        height={'100vh'}
        width={'100%'}
        defaultLanguage={undefined}
        defaultValue='// Weclocme to the playground'
        onMount={handleOnMount}
        options={{
            fontSize: 18,
          fontFamily: "Fira Code, monospace"
            
        }}
        language={extensionToFileType(activeFileTab?.extension)}
        onChange={handleChnage}
        value={ activeFileTab?.value ? activeFileTab.value : '//welcome to playground' }

      />}
 
    </>
  )
}


export default EditorComponent