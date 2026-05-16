import { useParams } from "react-router-dom"
import EditorComponent from "../components/molecules/EditorComponent/EditorComponent.jsx"
import { EditorButton } from "../components/atoms/EditorButton/EditorButton.jsx"
import TreeStructure from "../components/organisms/TreeStructure/TreeStructure.jsx"
import { useEffect } from "react"
import { useTreeStructureStore } from "../store/treeStructureStore.js"
import { useEditorSocketStore } from "../store/useEditorSocketStore.js"
import { io } from 'socket.io-client'


const ProjectPlayground = ()=>{
    
    const { projectId:projectIdFromUrl } = useParams();
    const { projectId, setProjectId } = useTreeStructureStore();

    const { setEditorSocket } = useEditorSocketStore()

    useEffect(()=>{
        

        if(projectIdFromUrl){
            setProjectId(projectIdFromUrl);
          const editorSocketConnection = io(`${import.meta.env.VITE_BACKEND_URL}/editor`,{
                query:{
                    projectId:projectIdFromUrl
                }
            })
            console.log('ProjectPlayground: created editor socket', editorSocketConnection)
            setEditorSocket(editorSocketConnection)
        }

        // return ()=>{
        //     if(editorSocketConnection && typeof editorSocketConnection.disconnect === 'function'){
        //         editorSocketConnection.disconnect();
        //     }
        //     // optional: clear the store reference so consumers don't use a stale socket
        //     try{ setEditorSocket(null) }catch(e){}
        // }

    },[setProjectId,projectIdFromUrl,setEditorSocket])


    return(
        <>
           
        <div style={{
            display:"flex",
        }}>

        
            {projectId && 
            (
                <div
                style={{
                    backgroundColor:'#333254',
                    padding:'10px',
                    paddingTop:'0.3vh',
                    minWidth:'250px',
                    maxWidth:'25%',
                    height:'100vh',
                    overflow:'auto',
                    marginRight:'10px'
                }}
                >
                    <TreeStructure />
                </div>
            )
            }  
            <EditorComponent/>
            </div>
            <EditorButton isActive={true}/>
            <EditorButton isActive={false}/>
        </>
    )
}

export default ProjectPlayground