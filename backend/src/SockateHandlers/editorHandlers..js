import fs, { readFile } from 'fs/promises'

export const handleEditorSocketEvents = (socket)=>{
    socket.on("writeFile",async({ data,pathToFileOrFolder })=>{
        try{
            const response = await fs.writeFile(pathToFileOrFolder,data);
            socket.emit("writeFileSuccess",{
                data:"File Written Successfully"
            })
        }
        catch(error){
            console.log("Error Writing the File",error);
            socket.emit("error",{
                data:'Error in Writing the file'
            })
            
        }

    })

    
    socket.on('createfile', async ({ pathToFileOrFolder })=>{

        const isFileAlreadyPresent = await fs.stat(pathToFileOrFolder);

        if(isFileAlreadyPresent){
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
            console.log("File contents:", response.toString());
            
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
        } catch (error) {
            console.log("Error Creating folder",error);
            socket.emit('ErrorCereatingFolder',{
                data:"Error creating Folder"
            })
        }
    });

    socket.on("deletingFolder", async ({ pathToFileOrFolder })=>{
        try {
            const response = await fs.rmdir(pathToFileOrFolder,{ recursive:true });
            socket.emit("deletingFolderSuccess",{
                data:"Folder deleted Successfully"
            })
        } catch (error) {
            console.log("Error deleting folder",error);
            socket.emit("ErrorDeletingfolder",{
                data:'Error deleting folder'
            })
            
        }
    })
}