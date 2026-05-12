import { useParams } from "react-router-dom"
import EditorComponent from "../components/molecules/EditorComponent/EditorComponent.jsx"
import { EditorButton } from "../components/atoms/EditorButton/EditorButton.jsx"

const ProjectPlayground = ()=>{
    
    const { projectId } = useParams()
    return(
        <>
            ProjectId:{projectId}

            <EditorComponent/>
            <EditorButton isActive={true}/>
            <EditorButton isActive={false}/>
        </>
    )
}

export default ProjectPlayground