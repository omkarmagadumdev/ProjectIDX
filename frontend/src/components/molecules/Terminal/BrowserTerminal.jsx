import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'
import { io } from 'https://cdn.socket.io/4.8.3/socket.io.esm.min.js'

const BrowserTerminal = () => {
  const terminalRef = useRef(null)

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
        fontFamily: 'Ubuntu',
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

      const socket = io('http://localhost:3000/shell', {
        transports: ['websocket'],
      })

      socket.on('connect', () => {
        console.log('browser connect')
      })

      socket.on('shell-output',(data)=>{
          term.write(data)
      })

      term.onData((data)=>{
        console.log(data);
        socket.emit('shell-input',data)
        
      })


      return () => {
        window.removeEventListener('resize', handleResize)
        try { 
          term.dispose() 
          socket.disconnect()
        } catch (e) {}
      }




  },[])


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