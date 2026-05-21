import { useFileContextMenuStore } from "../../../store/fileContextMenuStore";
import { useEditorSocketStore } from "../../../store/useEditorSocketStore";
import './FileContextManu.css'


export const FileContextMenu = ({
    x,
    y,
    path,

})=>{

    const { setIsOpen, isFolder } = useFileContextMenuStore();

    const { editorSocket } = useEditorSocketStore()

    function handleFileDelete(e,path){
        e.preventDefault();
        const targetType = isFolder ? 'folder' : 'file';
        console.log(`Deleting ${targetType} at `,path);
        const eventName = isFolder ? 'deletingFolder' : 'deleteFile';
        editorSocket.emit(eventName,{
            pathToFileOrFolder:path
        })
        setIsOpen(false);
    }

    function getParentPath(p){
        if(!p) return p;
        const idx = p.lastIndexOf('/');
        if(idx === -1) return '';
        return p.substring(0, idx);
    }

    function handleCreate(e, path, makeFolder=false){
        e.preventDefault();
        const name = window.prompt(makeFolder? 'Folder name' : 'File name');
        if(!name) return;
        // if path is a folder, create inside it; if path is a file, use its parent
        const parent = isFolder ? path : getParentPath(path);
        const newPath = parent ? `${parent}/${name}` : `./${name}`;
        const eventName = makeFolder ? 'createFolder' : 'createfile';
        editorSocket.emit(eventName, {
            pathToFileOrFolder: newPath
        });
        setIsOpen(false);
    }

    function handleRename(e,path){
        e.preventDefault();
        const newName = window.prompt('New name', path.substring(path.lastIndexOf('/')+1));
        if(!newName) return;
        const parent = getParentPath(path);
        const newPath = parent ? `${parent}/${newName}` : `./${newName}`;
        editorSocket.emit('rename', {
            oldPath: path,
            newPath
        });
        setIsOpen(false);
    }
    return(
        <div className="file-context-menu"
        onMouseLeave={()=>{
            console.log("Mouse Leave");
            setIsOpen(false)
            
        }}
        style={{
            width:'120px',
            position:'fixed',
            left:x,
            top:y,
            border:'1.5px solid black',
        }}
        
        >
            <button
            onClick={(e)=>handleFileDelete(e,path)}
            >{isFolder ? 'Delete folder' : 'Delete file'}</button>
            <button onClick={(e)=>handleCreate(e,path,false)}>Create file</button>
            <button onClick={(e)=>handleCreate(e,path,true)}>Create folder</button>
            <button onClick={(e)=>handleRename(e,path)}>Rename</button>
        </div>
    )
}