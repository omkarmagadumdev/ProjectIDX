import { useParams } from "react-router-dom"
import EditorComponent from "../components/molecules/EditorComponent/EditorComponent.jsx"
import { EditorButton } from "../components/atoms/EditorButton/EditorButton.jsx"
import TreeStructure from "../components/organisms/TreeStructure/TreeStructure.jsx"
import { useEffect } from "react"
import { useTreeStructureStore } from "../store/treeStructureStore.js"
import { useEditorSocketStore } from "../store/useEditorSocketStore.js"
import { io } from 'socket.io-client'
import BrowserTerminal from "../components/molecules/Terminal/BrowserTerminal.jsx"
import { useTerminalSocketStore } from "../store/terminalSocketStore.js"


const ProjectPlayground = ()=>{
    
    const { projectId:projectIdFromUrl } = useParams();
    const { projectId, setProjectId, setTreeStructure } = useTreeStructureStore();

    const { setEditorSocket, editorSocket} = useEditorSocketStore();
    const { setTerminalSocket} = useTerminalSocketStore()
        const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;

    function fetchPort(){
        console.log(editorSocket);
        
           editorSocket.emit("getPort");
           console.log("fetching port");
           
    }

    useEffect(()=>{
        let editorSocketConnection;

        let handleProjectTreeUpdated;

        if(projectIdFromUrl){
            setProjectId(projectIdFromUrl);
          editorSocketConnection = io(`${import.meta.env.VITE_BACKEND_URL}/editor`,{
                query:{
                    projectId:projectIdFromUrl
                }
            })

            console.log('ProjectPlayground: created editor socket', editorSocketConnection)

            handleProjectTreeUpdated = (payload) => {
                console.log('projectTreeUpdated received', payload);
                try{ setTreeStructure() }catch(e){ console.warn('setTreeStructure failed', e) }
            }

            editorSocketConnection.on('projectTreeUpdated', handleProjectTreeUpdated);

            const wsUrl = backendUrl.replace(/^http/, 'ws') + "/terminal?projectId=" + projectIdFromUrl;
            const ws= new WebSocket(wsUrl);
            
            setTerminalSocket(ws)

            setEditorSocket(editorSocketConnection)
        }

        return ()=>{
            // disconnect socket when leaving the playground
            try{
                if(editorSocketConnection && handleProjectTreeUpdated){
                    editorSocketConnection.off('projectTreeUpdated', handleProjectTreeUpdated);
                }
                if(editorSocketConnection && typeof editorSocketConnection.disconnect === 'function'){
                    editorSocketConnection.disconnect();
                }
                if(terminalSocket && typeof terminalSocket.close === 'function'){
                    terminalSocket.close();
                }
                setTerminalSocket(null)
                setEditorSocket(null)
            }catch(e){}
        }



            },[setProjectId,projectIdFromUrl,setEditorSocket,setTreeStructure,setTerminalSocket])


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
            <div>
                <button
                onClick={fetchPort}
                >
                    fetchport 
                </button>
            </div>
            <BrowserTerminal/>
        </>
    )
}

export default ProjectPlayground