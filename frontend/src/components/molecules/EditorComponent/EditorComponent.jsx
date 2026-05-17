import React, { useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { theme } from 'antd';
import { EditorButton } from '../../atoms/EditorButton/EditorButton';
import { useActiveFileTabStore } from '../../../store/useActiveFileTabStore';
import { useEditorSocketStore } from '../../../store/useEditorSocketStore';

const EditorComponent = () => {

  let timerId = null
  const { activeFileTab } = useActiveFileTabStore()
  const { editorSocket } = useEditorSocketStore()


  const [editorState, setEditorState] = useState({
    theme:null
  });



  async function downloadTheme(){
    const response = await fetch("/Dracula.json");
    const data = await  response.json();
    setEditorState(prev => ({...prev,theme:data}))
  }

  function handleChange(value){
      const editorContent = value;
      if(timerId != null){
        clearTimeout(timerId)
      }
     timerId =  setTimeout(()=>{   
              editorSocket.emit("writeFile",{
                data:editorContent,
                pathToFileOrFolder:activeFileTab.path
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
        // defaultValue='// Weclocme to the playground'
        onMount={handleOnMount}
        options={{
            fontSize: 18,
            fontFamily: "monospace"
            
        }}
        onChange={handleChange}
        value={activeFileTab?.value ? activeFileTab.value : '//Welcome to Playground'}
      />}
 
    </>
  )
}


export default EditorComponent