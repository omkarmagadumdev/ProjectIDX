import { create } from 'zustand'

export const useFileContextMenuStore = create((set)=>({
    x:null,
    y:null,
    isOpen:false,
    file:null,
    isFolder:false,

    setX:(incomingX)=>{
        set({
            x:incomingX
        })
    },
    setY:(incomingY)=>{
        set({
            y:incomingY
        })
    },
    setIsOpen:(incomingIsOpen)=>{
        set({
            isOpen:incomingIsOpen
        })
    },
    setFile:(iscomingFile)=>{
        set({
            file:iscomingFile
        })
    }
    ,
    setIsFolder:(incomingIsFolder)=>{
        set({
            isFolder:incomingIsFolder
        })
    }
}))

