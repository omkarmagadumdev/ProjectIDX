import { Input, Row } from "antd";
import {  useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom"
import { getProjectTree } from "../../../apis/project";
import { useEditorSocketStore } from "../../../store/useEditorSocketStore";
import { usePortStore } from "../../../store/portStore";
import { ReloadOutlined } from "@ant-design/icons";

export const Browser = ({ projectId }) => {
    
    const browserRef = useRef(null);
    const {port } = usePortStore()
    const [readyUrl, setReadyUrl] = useState(null)

    const { editorSocket } = useEditorSocketStore();
    
   


    useEffect(()=>{
        // clear any previous readyUrl when project changes
        setReadyUrl(null);

        // always request a fresh port for this project (prevents reusing a stale port)
        try{
            editorSocket?.emit?.("getPort",{
                containerName:projectId
            })
        }catch(e){
            console.warn('failed to emit getPort', e)
        }

        if(!port){
            return;
        }

        // poll the host port until the dev server responds before loading iframe
        let mounted = true;
        const url = `http://localhost:${port}`;

        const check = async () => {
            const maxAttempts = 120; // try longer while npm install + vite start
            const delay = 1500;
            for (let i = 0; i < maxAttempts && mounted; i++) {
                try {
                    const controller = new AbortController();
                    const timer = setTimeout(() => controller.abort(), 4000);
                    // try root first
                    let res = await fetch(url, { method: 'GET', cache: 'no-store', signal: controller.signal });
                    clearTimeout(timer);
                    if (res && (res.ok || res.type === 'opaque' || res.status === 200)) {
                        if (mounted) setReadyUrl(url);
                        return;
                    }

                    // try index.html as some dev servers respond there
                    const controller2 = new AbortController();
                    const timer2 = setTimeout(() => controller2.abort(), 4000);
                    res = await fetch(url + '/index.html', { method: 'GET', cache: 'no-store', signal: controller2.signal });
                    clearTimeout(timer2);
                    if (res && (res.ok || res.type === 'opaque' || res.status === 200)) {
                        if (mounted) setReadyUrl(url);
                        return;
                    }
                } catch (e) {
                    // ignore and retry
                }
                await new Promise(r => setTimeout(r, delay));
            }
            // do not set readyUrl if checks never succeeded — keep showing loading state
            console.warn('Browser health check timed out for', url);
        }

        check();

        return () => { mounted = false }
    },[port,editorSocket,projectId])

    if(!port || !readyUrl){
        return <div style={{color:'white',padding:'10px'}}>Loading application preview...</div>
    }

     function handleRefresh(){
            if(browserRef.current){
                const oldAddr =  browserRef.current.src
                browserRef.current.src  = oldAddr
            }
    }

    return(
        <Row
         style={
            {
                backgroundColor:'#22212b'
            }
         }
        >
            <Input
                style={{
                    width:"100%",
                    height:'30px',
                    color:'white',
                    fontFamily:'Fira Code',
                    backgroundColor:'#282a35'
                }}
                prefix={<ReloadOutlined onClick={handleRefresh} />}
                defaultValue={readyUrl}
                
            />

            <iframe
            ref={browserRef}
            src={readyUrl}
            style={{
                width:'100%',
                height:'95vh',
                border:'none'

            }}
            />
        </Row>
    )
}