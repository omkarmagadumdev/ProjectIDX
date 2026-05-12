import { useParams } from "react-router-dom"
import EditorComponent from "../components/molecules/EditorComponent/EditorComponent.jsx"
import { EditorButton } from "../components/atoms/EditorButton/EditorButton.jsx"
import TreeStructure from "../components/organisms/TreeStructure/TreeStructure.jsx"
import { useEffect } from "react"
import { useTreeStructureStore } from "../store/treeStructureStore.js"

const ProjectPlayground = ()=>{
    
    const { projectId:projectIdFromUrl } = useParams();
    const { projectId, setProjectId } = useTreeStructureStore();

    useEffect(()=>{
            setProjectId(projectIdFromUrl)
    },[setProjectId,projectIdFromUrl])
    return(
        <>
           
        <div style={{
            display:"flex",
        }}>

        
            {projectId && 
            (
                <div
                style={{
                    backgroundColor:'#333254',
                    padding:'10px',
                    paddingTop:'0.3vh',
                    minWidth:'250px',
                    maxWidth:'25%',
                    height:'84.7ch',
                    overflow:'auto',
                    marginRight:'10px'
                }}
                >
                    <TreeStructure />
                </div>
            )
            }  
            <EditorComponent/>
            </div>
            <EditorButton isActive={true}/>
            <EditorButton isActive={false}/>
        </>
    )
}

export default ProjectPlayground