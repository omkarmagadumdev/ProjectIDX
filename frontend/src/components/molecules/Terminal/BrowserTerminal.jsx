import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'
import { useParams } from 'react-router-dom'
import { AttachAddon } from '@xterm/addon-attach'
import { useTerminalSocketStore } from '../../../store/terminalSocketStore'

const BrowserTerminal = () => {
  const terminalRef = useRef(null)
  const socket = useRef(null)
  const { projectId:projectIdFromUrl } = useParams(); 

  const { terminalSocket } = useTerminalSocketStore()

  useEffect(()=>{


      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: "#282a37",
          foreground: "#f8f8f3",
          cursor: "#f8f8f3",
          cursorAccent: "#282a37",
          selectionBackground: "rgba(248,248,243,0.12)",
          selectionForeground: "#f8f8f3",
          selectionInactiveBackground: "rgba(248,248,243,0.06)",
          black: "#1c1f2a",
          red: "#ff6c6b",
          green: "#98be65",
          yellow: "#ecbe7b",
          blue: "#51afef",
          magenta: "#c678dd",
          cyan: "#46d9ff",
          white: "#f8f8f2",
          brightBlack: "#5b6268",
          brightRed: "#ff6c6b",
          brightGreen: "#b4f99b",
          brightYellow: "#ffd580",
          brightBlue: "#9ad7ff",
          brightMagenta: "#d6b3ff",
          brightCyan: "#9ef0ff",
          brightWhite: "#ffffff",
        },
        fontSize: 16,
        fontFamily: 'Fira Code, monospace',
        convertEol: true
      });

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)

      if (terminalRef.current) {
        term.open(terminalRef.current)
        fitAddon.fit()
        term.writeln('Welcome to the in-browser terminal')
      }

      const handleResize = () => {
        try { fitAddon.fit() } catch (e) {}
      }
      window.addEventListener('resize', handleResize)

      // const socket = io('http://localhost:3000/shell', {
      //   transports: ['websocket'],
      //   query: { projectId: projectIdFromUrl }
      // })


      if (!terminalSocket) return

      // keep a ref to the active socket
      socket.current = terminalSocket

      // WebSocket uses `onopen` (lowercase)
      terminalSocket.onopen = () => {
        const attchAddon = new AttachAddon(terminalSocket)
        term.loadAddon(attchAddon)
      }


      return () => {
        window.removeEventListener('resize', handleResize)
        try {
          term.dispose()
        } catch (e) {}
        try {
          if (socket.current) socket.current.close()
        } catch (e) {}
      }




  },[terminalSocket])


  return (
      <div
      ref={terminalRef}
        style={{
          height:'25vh',
          overflow:'auto',
        }}
        className="terminal"
        id='terminal-container'
      >

      </div>
  )
}

export default BrowserTerminal 