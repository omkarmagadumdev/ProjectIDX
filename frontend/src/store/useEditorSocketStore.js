import { create } from "zustand";
import { useActiveFileTabStore } from "./useActiveFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";


export const useEditorSocketStore = create((set)=>({
    editorSocket:null,
    setEditorSocket:(incomingSocket)=>{


            const activeFileTabSetter = useActiveFileTabStore.getState().setActiveFileTab;
            const projectTreeStructureSetter = useTreeStructureStore.getState().setTreeStructure

           incomingSocket?.on("readFileSuccess",  (data) => {
             console.log("read file succcess", data);
             activeFileTabSetter(data.value, data.path)
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

        set({
            editorSocket:incomingSocket
        })
    }
}))