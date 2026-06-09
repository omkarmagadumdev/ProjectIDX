import { useParams } from "react-router-dom"
import EditorComponent from "../components/molecules/EditorComponent/EditorComponent.jsx"
import { EditorButton } from "../components/atoms/EditorButton/EditorButton.jsx"
import TreeStructure from "../components/organisms/TreeStructure/TreeStructure.jsx"
import { useEffect, useState } from "react"
import { useTreeStructureStore } from "../store/treeStructureStore.js"
import { useEditorSocketStore } from "../store/useEditorSocketStore.js"
import { io } from 'socket.io-client'
import BrowserTerminal from "../components/molecules/Terminal/BrowserTerminal.jsx"
import { useTerminalSocketStore } from "../store/terminalSocketStore.js"
import { Browser } from "../components/organisms/Browser/Browser.jsx"
import { usePortStore } from "../store/portStore.js"
import { Button } from "antd/es/radio/index.js"
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { Divider } from "antd"


const ProjectPlayground = () => {

    const { projectId: projectIdFromUrl } = useParams();
    const { projectId, setProjectId, setTreeStructure } = useTreeStructureStore();
    const [loadBrowser, setLoadBrowser] = useState(false)

    const { setEditorSocket, editorSocket } = useEditorSocketStore();
    const { terminalSocket, setTerminalSocket } = useTerminalSocketStore()
    const { setPort } = usePortStore();
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;

    function fetchPort() {
        if (editorSocket && projectId) {
            editorSocket.emit('getPort', { containerName: projectId });
            console.log('fetching port for', projectId);
        } else {
            console.log('cannot fetch port yet', { editorSocket, projectId });
        }

    }

    useEffect(() => {
        let editorSocketConnection;

        let handleProjectTreeUpdated;

        if (projectIdFromUrl) {
            setProjectId(projectIdFromUrl);
            try { setPort(null) } catch (e) { }
            editorSocketConnection = io(`${backendUrl}/editor`, {
                query: {
                    projectId: projectIdFromUrl
                }
            })

            console.log('ProjectPlayground: created editor socket', editorSocketConnection)

            editorSocketConnection.on('connect', () => {
                console.log('ProjectPlayground: editor socket connected', {
                    socketId: editorSocketConnection.id,
                    projectId: projectIdFromUrl,
                    url: backendUrl
                });
            });

            editorSocketConnection.on('connect_error', (error) => {
                console.error('ProjectPlayground: editor socket connect_error', error);
            });

            handleProjectTreeUpdated = (payload) => {
                console.log('projectTreeUpdated received', payload);
                try { setTreeStructure() } catch (e) { console.warn('setTreeStructure failed', e) }
            }

            editorSocketConnection.on('projectTreeUpdated', handleProjectTreeUpdated);

            const wsUrl = backendUrl.replace(/^http/, 'ws') + "/terminal?projectId=" + projectIdFromUrl;
            const ws = new WebSocket(wsUrl);

            setTerminalSocket(ws)

            setEditorSocket(editorSocketConnection)
        }

        return () => {
            // disconnect socket when leaving the playground
            try {
                if (editorSocketConnection && handleProjectTreeUpdated) {
                    editorSocketConnection.off('projectTreeUpdated', handleProjectTreeUpdated);
                }
                if (editorSocketConnection) {
                    editorSocketConnection.off('connect');
                    editorSocketConnection.off('connect_error');
                }
                if (editorSocketConnection && typeof editorSocketConnection.disconnect === 'function') {
                    editorSocketConnection.disconnect();
                }
                if (terminalSocket && typeof terminalSocket.close === 'function') {
                    terminalSocket.close();
                }
                setTerminalSocket(null)
                setEditorSocket(null)
            } catch (e) { }
        }



    }, [setProjectId, projectIdFromUrl, setEditorSocket, setTreeStructure])

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


    return (
        <>

            <div style={{
                display: "flex",
                height: '100vh',
                width: '100%',
                overflow: 'hidden',
            }}>


                {projectId &&
                    (
                        <div
                            style={{
                                backgroundColor: '#333254',
                                padding: '10px',
                                paddingTop: '0.3vh',
                                width: '250px',
                                minWidth: '250px',
                                maxWidth: '25vw',
                                flexShrink: 0,
                                height: '100%',
                                overflow: 'auto',
                                // marginRight:'10px'
                            }}
                        >
                            <TreeStructure />
                        </div>
                    )
                }
                <div
                    style={
                        {
                            height: '100%',
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                        }
                    }
                >
                    <Allotment>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                width: '100%',
                                minWidth: 0,
                                minHeight: 0,
                                overflow: 'hidden',
                                backgroundColor: '#282a36'
                            }}
                        >
                            <Allotment
                                vertical={true}
                            >
                                <div style={{ height: '100%', minHeight: 0, minWidth: 0 }}>
                                    <EditorComponent />
                                </div>
                                <div style={{ height: '100%', minHeight: 220, minWidth: 0 }}>
                                    <BrowserTerminal />
                                </div>
                            </Allotment>
                            

                        </div>
                        <div style={{ minWidth: 320, overflow: 'auto' }}>
                            <Button
                                onClick={() => setLoadBrowser(true)}
                            >
                                Load Live Browser
                            </Button>
                            <Button
                                style={{ marginLeft: 8 }}
                                onClick={() => {
                                    if (!terminalSocket || terminalSocket.readyState !== WebSocket.OPEN) {
                                        alert('Terminal is not connected yet');
                                        return;
                                    }

                                    try {
                                        terminalSocket.send('cd /home/sandbox/app/sandbox\n');
                                        terminalSocket.send('npm install --no-fund --no-audit --progress=false\n');
                                    } catch (e) {
                                        console.error('install failed', e);
                                        alert('Install command could not be sent');
                                    }
                                }}
                            >
                                Install Dependencies
                            </Button>
                            {loadBrowser && terminalSocket && <Browser projectId={projectIdFromUrl} />}
                        </div>

                    </Allotment>


                </div>
            </div>
            {/* <EditorButton isActive={true} />
            <EditorButton isActive={false} /> */}


            {/* ensure we fetch the latest host port when sockets become available */}

            {
                (() => {
                    /* effect hook cannot be placed inside JSX, so we'll rely on a separate effect below */
                    return null;
                })()
            }
        </>
    )
}

export default ProjectPlayground
