import fs, { readFile } from 'fs/promises'
import { getContainerPort } from '../containers/handleCreateContainers.js';

export const handleEditorSocketEvents = (socket,editorNamespace)=>{

    const getProjectId = () => socket.data?.projectId || socket.handshake?.query?.projectId || socket.handshake?.auth?.projectId;

    const emitToProjectRoom = (eventName, payload, includeSender = true) => {
        const projectId = getProjectId();
        if (editorNamespace && projectId) {
            if (includeSender) {
                editorNamespace.to(projectId).emit(eventName, payload);
            } else {
                socket.to(projectId).emit(eventName, payload);
            }
            return;
        }
        socket.emit(eventName, payload);
    };

    const emitTreeUpdated = () => {
        try {
            const projectId = getProjectId();
            emitToProjectRoom('projectTreeUpdated', { projectId }, true);
        } catch (e) {
            console.warn('Error broadcasting projectTreeUpdated', e);
        }
    }


    socket.on("writeFile",async({ data,pathToFileOrFolder })=>{
        try{
            const response = await fs.writeFile(pathToFileOrFolder,data);
            emitToProjectRoom("writeFileSuccess",{
                data:"File Written Successfully",
                path:pathToFileOrFolder
            }, true)
        }
        catch(error){
            console.log("Error Writing the File",error);
            socket.emit("error",{
                data:'Error in Writing the file',
                path:pathToFileOrFolder
            })
            
        }

    })

    
    socket.on('createfile', async ({ pathToFileOrFolder })=>{
        let exists = false;
        try{
            await fs.stat(pathToFileOrFolder);
            exists = true;
        }catch(e){ exists = false }

        if(exists){
            socket.emit('error',{
                data:"File already Exists"
            })
            return;
        }

        try{
                const response = await   fs.writeFile(pathToFileOrFolder,"");
                socket.emit("createFileSuccess",{
                    data:'File Created Successfully'
                })
                emitTreeUpdated();
        }
        catch(error){
            console.log("Error Writing a fileOofolder",error);
            socket.emit('error',{
                data:"Error Creating the File"
            })
        }
            
    })

    socket.on("readfile",async({ pathToFileOrFolder })=>{
        console.log("readfile event received with path:", pathToFileOrFolder);
        try {
            const response = await readFile(pathToFileOrFolder);
            // console.log("File contents:", response.toString());
            
            socket.emit("readFileSuccess",{
                value:response.toString(),
                path:pathToFileOrFolder
            });

        } catch (error) {
            console.log("error reading the file",error);
            socket.emit('error',{
                data:"Error reading the file"
            })
            
        }

    });


    socket.on("deleteFile",async ({ pathToFileOrFolder })=>{
            try {
                const response = await fs.unlink(pathToFileOrFolder);   
                socket.emit("deleteFileSuccess",{
                    data:"File Deleted succesfully"
                })
                emitTreeUpdated();
            } catch (error) {
                console.log("Error Deleting The File",error);
                socket.emit("errorDeleting",{
                    data:"Error Deleting the file"
                })
                
            }
    })

    socket.on("createFolder", async ({ pathToFileOrFolder })=>{
        try {
            const response = await fs.mkdir(pathToFileOrFolder);
            socket.emit("FolderCreatedSuccess",{
                data:"Folder Created succesfully"
            })
            emitTreeUpdated();
        } catch (error) {
            console.log("Error Creating folder",error);
            socket.emit('ErrorCereatingFolder',{
                data:"Error creating Folder"
            })
        }
    });

    socket.on("deletingFolder", async ({ pathToFileOrFolder })=>{
        console.log("deletingFolder event received with path:", pathToFileOrFolder);
        try {
            const response = await fs.rm(pathToFileOrFolder,{ recursive:true, force:true });
            socket.emit("deletingFolderSuccess",{
                data:"Folder deleted Successfully"
            })
            emitTreeUpdated();
        } catch (error) {
            console.log("Error deleting folder",error);
            socket.emit("ErrorDeletingfolder",{
                data:'Error deleting folder'
            })
            
        }
    })

    // rename handler
    socket.on('rename', async ({ oldPath, newPath }) => {
        console.log('rename event received', { oldPath, newPath });
        try {
            await fs.rename(oldPath, newPath);
            socket.emit('renameSuccess', { oldPath, newPath });
            emitTreeUpdated();
        } catch (err) {
            console.error('Error renaming', err);
            socket.emit('renameError', { error: String(err) });
        }
    })

    socket.on("getPort",async({ containerName })=>{
        const port = await getContainerPort(containerName);
        console.log("port data",port);
        socket.emit('getPortSuccess',{
            port:port,
        })
        
    })
}