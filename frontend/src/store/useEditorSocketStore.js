import { create } from "zustand";
import { useActiveFileTabStore } from "./useActiveFileTabStore";
import { useTreeStructureStore } from "./treeStructureStore";
import { usePortStore } from "./portStore";


export const useEditorSocketStore = create((set)=>({
    editorSocket:null,
    setEditorSocket:(incomingSocket)=>{
            const activeFileTabStore = useActiveFileTabStore.getState();
            const activeFileTabSetter = activeFileTabStore.setActiveFileTab;
            const projectTreeStructureSetter = useTreeStructureStore.getState().setTreeStructure;
            const portSetter = usePortStore.getState().setPort;


                     incomingSocket?.on("readFileSuccess",  (data) => {
                         console.log("read file succcess", data);
                         // derive extension from the filename (after last '/') and normalize
                         const fileName = String(data.path).split('/').pop() || '';
                         const rawExt = fileName.includes('.') ? fileName.split('.').pop() : '';
                         const fileExtension = rawExt.toLowerCase();
                         activeFileTabSetter(data.value, data.path, fileExtension)
                        })

            incomingSocket?.on("writeFileSuccess",(data)=>{
                console.log("write File Success",data);
                useActiveFileTabStore.getState().updateTabContent(data.path, data.value ?? useActiveFileTabStore.getState().getActiveFileTab()?.value ?? '')
            })
            
            incomingSocket?.on("deleteFileSuccess",(data)=>{
                console.log("Delete file Success");
                useActiveFileTabStore.getState().closeTab(data?.path)
                projectTreeStructureSetter()
            })

            incomingSocket?.on("deletingFolderSuccess", (data) => {
                useActiveFileTabStore.getState().closeTabsUnderPath(data?.path)
                projectTreeStructureSetter()
            })

            incomingSocket?.on("renameSuccess", ({ oldPath, newPath }) => {
                useActiveFileTabStore.getState().renameTab(oldPath, newPath)
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
