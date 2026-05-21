import { useQueries } from "@tanstack/react-query";
import { getProjectTree } from "../../../apis/project";

export default function useProjectTree( projectId ){

       const { isLoading,isError,error,data:projectTree } =  useQueries({
            queryFn:()=> getProjectTree({ projectId })
        });


        return{
            isLoading,
            isError,
            error,
            projectTree
        }
}