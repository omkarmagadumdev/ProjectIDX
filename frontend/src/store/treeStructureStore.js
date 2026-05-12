import { create } from 'zustand'
import { getProjectTree } from '../apis/project'
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient(); // Create once, outside the store

export const useTreeStructureStore = create((set, get) => ({
    projectId: null,
    treeStructure: null,
    
    setTreeStructure: async () => {
        const id = get().projectId;
        const data = await queryClient.fetchQuery({
            queryKey: [`projectId-${id}`],
            queryFn: () => getProjectTree({ projectId: id }),
        });

        console.log(data);

        set({
            treeStructure: data
        });
    },

    setProjectId: (projectId) => {
        set({
            projectId: projectId
        });
    }
}));