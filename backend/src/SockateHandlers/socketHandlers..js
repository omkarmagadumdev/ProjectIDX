import fs from 'fs/promises'

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
}