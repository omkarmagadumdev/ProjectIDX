import { useState } from "react";
import { GoChevronRight } from "react-icons/go";
import { GoChevronDown } from "react-icons/go";
import FileIcon from '../../atoms/Fileicon/FileIcon';
import { useEditorSocketStore } from "../../../store/useEditorSocketStore";


export const TreeNode = ({
    fileFolderData
})=>{
     const [ visibility,setVisibility ] = useState({})
    if (!fileFolderData) return null;

    const hasChildren = Array.isArray(fileFolderData.children) && fileFolderData.children.length > 0;
    
    const {editorSocket} = useEditorSocketStore()

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

        editorSocket.emit('readFile',{
            path:filePath,
            pathToFileOrFolder:filePath
        })

    }
    
    return(
       <div 
        style={{
            padding:'2px 0',
            color:"white"
        }}
        >
            { hasChildren ? (
                <div>
               <button 
               onClick={()=> toggleVisiblity(fileFolderData.name)}
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
                >
                    
                    {fileFolderData.name}
                </p>
                </div>
            )}
            {visibility[fileFolderData.name] && fileFolderData.children && (
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