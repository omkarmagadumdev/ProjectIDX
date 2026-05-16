import React, { useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { theme } from 'antd';
import { EditorButton } from '../../atoms/EditorButton/EditorButton';
import { useEditorSocketStore } from '../../../store/useEditorSocketStore';
import { useActiveFileTabStore } from '../../../store/useActiveFileTabStore';

const EditorComponent = () => {

  const { editorSocket } = useEditorSocketStore()
  const { activeFileTab,setActiveFileTab } = useActiveFileTabStore()

  const [editorState, setEditorState] = useState({
    theme:null
  });

  async function downloadTheme(){
    const response = await fetch("/Dracula.json");
    const data = await  response.json();
    setEditorState(prev => ({...prev,theme:data}))
  }


  useEffect(()=>{
    if (!editorSocket) return

    const handleReadFileSuccess = (data) => {
      console.log("read file succcess", data);
      setActiveFileTab(data.value, data.path)
    }

    // attach listener
    if (typeof editorSocket.on === 'function') {
      editorSocket.on("readFileSuccess", handleReadFileSuccess)
    }

    // cleanup
    return () => {
      if (editorSocket && typeof editorSocket.off === 'function') {
        editorSocket.off("readFileSuccess", handleReadFileSuccess)
      }
    }
  }, [editorSocket, setActiveFileTab])

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
        value={activeFileTab?.value ? activeFileTab.value : '//Welcome to Playground'}
      />}
 
    </>
  )
}


export default EditorComponent