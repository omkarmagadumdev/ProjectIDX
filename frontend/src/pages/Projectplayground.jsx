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
import { Browser } from "../components/organisms/Browser/Browser.jsx"
import { usePortStore } from "../store/portStore.js"


const ProjectPlayground = ()=>{
    
    const { projectId:projectIdFromUrl } = useParams();
    const { projectId, setProjectId, setTreeStructure } = useTreeStructureStore();
    const { port ,setPort } = usePortStore()

    const { setEditorSocket, editorSocket} = useEditorSocketStore();
    const { terminalSocket,setTerminalSocket} = useTerminalSocketStore()
        const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;

    function fetchPort(){
        if(editorSocket && projectId){
            editorSocket.emit('getPort',{ containerName: projectId });
            console.log('fetching port for', projectId);
        } else {
            console.log('cannot fetch port yet', { editorSocket, projectId });
        }
           
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



            },[setProjectId,projectIdFromUrl,setEditorSocket,setTreeStructure])

    // When both editor and terminal sockets become available, request the current host port
    useEffect(() => {
        if (editorSocket && terminalSocket && projectId) {
            try {
                editorSocket.emit('getPort', { containerName: projectId });
                console.log('requested port for', projectId);
            } catch (e) {
                console.warn('failed to request port', e);
            }
        }
    }, [editorSocket, terminalSocket, projectId]);


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

            {/* ensure we fetch the latest host port when sockets become available */}
            
            {
                (() => {
                    /* effect hook cannot be placed inside JSX, so we'll rely on a separate effect below */
                    return null;
                })()
            }


            <div>
                {projectIdFromUrl && terminalSocket &&  <Browser projectId={projectIdFromUrl}/>}
            </div>
        </>
    )
}

export default ProjectPlayground