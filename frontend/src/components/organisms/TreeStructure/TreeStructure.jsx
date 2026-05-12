import React, { useEffect } from 'react'
import { useTreeStructureStore } from '../../../store/treeStructureStore'
import { TreeNode } from '../../molecules/TreeNode/TreeNode.jsx'


const TreeStructure = () => {

  const { treeStructure,setTreeStructure } = useTreeStructureStore();



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
      <TreeNode fileFolderData={treeStructure} />
      </>
   
  )
}

export default TreeStructure