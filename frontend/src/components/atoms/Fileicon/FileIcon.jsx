import React from 'react'
import { 
  GoFile, 
  GoFileCode, 
  GoFileMedia, 
  GoFileZip, 
  GoFileBinary,
  GoFileDirectoryFill,
  GoFileSubmodule
} from 'react-icons/go'

const FileIcon = ({ name, isFolder = false }) => {
  if (!name) return <GoFile style={{ fontSize: '16px' }} />
  
  // If it's a folder, return folder icon
  if (isFolder) {
    return <GoFileDirectoryFill style={{ color: '#FFD580', fontSize: '16px' }} />
  }

  // Get file extension
  const extension = name.split('.').pop()?.toLowerCase() || ''

  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rb', 'php'].includes(extension)) {
    return <GoFileCode style={{ color: '#FFD580', fontSize: '16px' }} />
  }

  // HTML files
  if (extension === 'html' || extension === 'htm') {
    return <GoFileCode style={{ color: '#E34C26', fontSize: '16px' }} />
  }

  // Image files
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(extension)) {
    return <GoFileMedia style={{ color: '#FF6B9D', fontSize: '16px' }} />
  }

  // Document files
  if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(extension)) {
    return <GoFileBinary style={{ color: '#87CEEB', fontSize: '16px' }} />
  }

  // Archive files
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
    return <GoFileZip style={{ color: '#FF7F50', fontSize: '16px' }} />
  }

  // JSON
  if (['json'].includes(extension)) {
    return <GoFileCode style={{ color: '#FFD700', fontSize: '16px' }} />
  }

  // CSS
  if (['css', 'scss', 'sass', 'less'].includes(extension)) {
    return <GoFileCode style={{ color: '#87CEEB', fontSize: '16px' }} />
  }

  // Dotfiles like .gitignore
  if (name === '.gitignore' || name.endsWith('.gitignore')) {
    return <GoFileSubmodule style={{ color: '#8A8A8A', fontSize: '16px' }} />
  }

  // Default file icon
  return <GoFile style={{ color: '#CCCCCC', fontSize: '16px' }} />
}

export default FileIcon