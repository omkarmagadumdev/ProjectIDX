import { useMutation } from "@tanstack/react-query"
import { createProjectApi } from "../../../apis/project.js"

export const useCreateProject = ()=>{
const { mutateAsync,isPending,isSuccess,isError } = useMutation({
            mutationFn:createProjectApi,
            onSuccess:(data)=>{
                console.log("project created successfully");
                
            },
            onError:()=>{
                console.log('error creating it');
                
            }  
        })

        
        return {
            createProjectMutation:mutateAsync,
            isPending,
            isSuccess,
            isError
        }
}