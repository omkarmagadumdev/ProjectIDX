import React, { useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { theme } from 'antd';
import { EditorButton } from '../../atoms/EditorButton/EditorButton';

const EditorComponent = () => {

  const [editorState, setEditorState] = useState({
    theme:null
  });

  async function downloadTheme(){
    const response = await fetch("/Dracula.json");
    const data = await  response.json();
    setEditorState({...editorState,theme:data})
  }

  useEffect(()=>{
      downloadTheme()
  },[])

  function handleOnMount (editor,monaco){
    if(editorState.theme) {
      monaco.editor.defineTheme('Dracula', editorState.theme);
      monaco.editor.setTheme('Dracula');
    }
  }

  return ( 
    <>
      {editorState.theme && <Editor 
        height={'100vh'}
        width={'100%'}
        defaultLanguage='javascript'
        defaultValue='// Weclocme to the playground'
        onMount={handleOnMount}
        options={{
            fontSize: 18,
            fontFamily: "monospace"
            
        }}
      />}
 
    </>
  )
}

export default EditorComponent