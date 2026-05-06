import { Button,Layout } from "antd";
import { useCreateProject } from "../hooks/apis/mutations/useCreateProject"
import "./CreateProject.css"

export const CreateProject= () => {
 
  const  { createProjectMutation } =  useCreateProject();



  const { Header,Content,Footer } = Layout

    async function handleCreateProject(){
            console.log('Going to trugger the api');
            try{
                    await createProjectMutation()
                    console.log("now we can redirtect to editor");
                    
            }
            catch(error){
                console.log(error);
  
            }
            
    }


    return (
      <div className="create-project-wrapper">
        <Layout className="create-project-layout">
          <Header className="create-project-header">Header</Header>
          <Content className="create-project-content">  
            <Button
            onClick={handleCreateProject}
            className="create-project-button"
            >
                Create PlayGround
            </Button></Content>
          <Footer className="create-project-footer">Footer</Footer>
        </Layout>
      </div>
    );
}