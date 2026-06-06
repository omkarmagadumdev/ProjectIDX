import { create } from "zustand";
import { useActiveFileTabStore } from "./useActiveFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";
import { usePortStore } from "./portStore";


export const useEditorSocketStore = create((set)=>({
    editorSocket:null,
    setEditorSocket:(incomingSocket)=>{


            const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;
            const projectTreeStructureSetter = useTreeStructureStore.getState().setTreeStructure;
            const portSetter = usePortStore.getState().setPort;


           incomingSocket?.on("readFileSuccess",  (data) => {
             console.log("read file succcess", data);
             const fileExtension = data.path.split('.').pop()
             activeFileTabSetter(data.value, data.path,fileExtension)
            })

            incomingSocket?.on("writeFileSuccess",(data)=>{
                console.log("write File Success",data);
                incomingSocket.emit("readfile",{
                    pathToFileOrFolder:data.path
                })
            })
            
            incomingSocket?.on("deleteFileSuccess",()=>{
                console.log("Delete file Success");
                
                projectTreeStructureSetter()
            })

            incomingSocket?.on("getPortSuccess",({port})=>{
                    console.log(port);    
                    portSetter(port)
            })

        set({
            editorSocket:incomingSocket
        })
    }
}))