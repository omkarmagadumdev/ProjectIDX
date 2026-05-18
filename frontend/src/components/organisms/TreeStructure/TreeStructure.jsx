import React, { useEffect, useState } from 'react'
import { useTreeStructureStore } from '../../../store/treeStructureStore'
import { TreeNode } from '../../molecules/TreeNode/TreeNode.jsx'
import { useFileContextMenuStore } from '../../../store/fileContextMenuStore.js';
import { FileContextMenu } from '../../molecules/ContextManu/FileContextManu.jsx';


const TreeStructure = () => {

  const { treeStructure,setTreeStructure } = useTreeStructureStore();
  const { isOpen:isFileContextOpen,x:fileContextX,y:fileContextY, file} = useFileContextMenuStore()

  useEffect(()=>{
      if(treeStructure){
        console.log("tree",treeStructure);
        
      }
      else{
        setTreeStructure()
      }
  },[setTreeStructure,treeStructure])

  return (
      <>
      {isFileContextOpen && fileContextX && fileContextY &&(
        <FileContextMenu
          x={fileContextX}
          y={fileContextY}
          path={file}
        />
      )}
      <TreeNode fileFolderData={treeStructure} />
      </>
   
  )
}

export default TreeStructure