import { useState } from "react";
import { GoChevronRight } from "react-icons/go";
import { GoChevronDown } from "react-icons/go";
import FileIcon from '../../atoms/Fileicon/FileIcon';
import { useEditorSocketStore } from "../../../store/useEditorSocketStore";
import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";


export const TreeNode = ({
    fileFolderData
})=>{
     const [ visibility,setVisibility ] = useState({})
    const {editorSocket} = useEditorSocketStore()


    const { 
        setX:setFileContextMenuX,
        setY:setFileContextManuY,
        setIsOpen:setFileContextManuIsOpen,
        setFile,
        setIsFolder
    } = useFileContextMenuStore()
        



    if (!fileFolderData) return null;

    // A node is a folder if it has a children array, even when it's empty.
    const isFolderNode = Array.isArray(fileFolderData.children);
    const hasChildren = isFolderNode && fileFolderData.children.length > 0;

    function toggleVisiblity(name){
        setVisibility({
            ...visibility,
            [name]:!visibility[name]
        })
    }

    function handleOnDoubleClick(fileFolderData){
        console.log("double clicked",fileFolderData);

        const filePath = fileFolderData?.path;

        if (!editorSocket || !filePath) {
            console.warn("Cannot request file contents", {
                hasSocket: Boolean(editorSocket),
                filePath,
            });
            return;
        }

        console.log("Emitting readfile event with path:", filePath);
        editorSocket.emit('readfile',{
            path:filePath,
            pathToFileOrFolder:filePath
        })

    }

    function handleContextMenuForFiles(e,path,isFolder){
        e.preventDefault();
        console.log('Right Clicked on',path,e,'isFolder:',isFolder);
        setFile(path);
        if(typeof setIsFolder === 'function') setIsFolder(Boolean(isFolder));
        setFileContextMenuX(e.clientX)
        setFileContextManuY(e.clientY)
        setFileContextManuIsOpen(true)
    }
    
    return(
       <div 
        style={{
            padding:'2px 0',
            color:"white"
        }}
        >
            { isFolderNode ? (
                <div>
               <button 
               onClick={()=> toggleVisiblity(fileFolderData.name)}
               onContextMenu={(e)=> handleContextMenuForFiles(e,fileFolderData.path, true)}
               style={{
                border:'none',
                outline:'none',
                color:'white',
                backgroundColor:'transparent',
                padding:'4px 6px',
                fontSize:'16px',
                cursor:'pointer'
               ,display:'flex',
               alignItems:'center',
               gap:'6px'
               }}
               >
               {visibility[fileFolderData.name] ? <GoChevronDown/> : <GoChevronRight/>}
               <FileIcon name={fileFolderData.name} isFolder={true} />
                {fileFolderData.name}
               </button>
               </div>

            ) :(
               <div style={{
                display:'flex',
                alignItems:'center',
                gap:'6px',
                padding:'4px 6px'
               }}>
                <FileIcon name={fileFolderData.name} isFolder={false} />
                <p 
                style={{
                    margin:'0',
                    fontSize:'15px',
                    cursor:'pointer',
                    color:'white'
                }}
                onDoubleClick={()=>handleOnDoubleClick(fileFolderData)}
                onContextMenu={(e)=> handleContextMenuForFiles(e,fileFolderData.path, false)}
                >
                    
                    {fileFolderData.name}
                </p>
                </div>

            )}
            {visibility[fileFolderData.name] && hasChildren && (
                <div style={{ paddingLeft: '14px' }}>
                {fileFolderData.children.map((child)=>
                    <TreeNode 
                    fileFolderData={child}
                    key={child.name}
                    />
                )}
                </div>
            )}
        </div>
    )
}