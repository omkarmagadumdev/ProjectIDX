import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'
import { AttachAddon } from '@xterm/addon-attach'
import { useTerminalSocketStore } from '../../../store/terminalSocketStore'
import './BrowserTerminal.css'

const BrowserTerminal = () => {
  const terminalRef = useRef(null)
  const socket = useRef(null)
  const { terminalSocket } = useTerminalSocketStore()

  useEffect(()=>{
      const term = new Terminal({
        cursorBlink: true,
        scrollback: 2000,
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

      const fitTerminal = () => {
        try {
          if (!terminalRef.current || terminalRef.current.clientWidth === 0 || terminalRef.current.clientHeight === 0) {
            return
          }
          fitAddon.fit()
        } catch (e) {}
      }

      if (terminalRef.current) {
        term.open(terminalRef.current)
        requestAnimationFrame(() => {
          fitTerminal()
          requestAnimationFrame(fitTerminal)
        })
        setTimeout(fitTerminal, 100)
        setTimeout(fitTerminal, 350)
        try {
          term.writeln('Welcome to the in-browser terminal')
        } catch (e) {}
      }

      const handleResize = () => {
        fitTerminal()
      }
      window.addEventListener('resize', handleResize)

      const resizeObserver = new ResizeObserver(() => {
        fitTerminal()
      })

      if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current)
      }

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          fitTerminal()
        }).catch(() => {})
      }

      let attachAddon = null
      const attachTerminal = () => {
        if (!terminalSocket || attachAddon) {
          return
        }
        attachAddon = new AttachAddon(terminalSocket)
        term.loadAddon(attachAddon)
        fitTerminal()
      }

      if (terminalSocket) {
        socket.current = terminalSocket

        try {
          // ensure binary frames are used so control sequences (Ctrl+C) are forwarded as binary
          terminalSocket.binaryType = 'arraybuffer'
        } catch (e) {
          console.warn('failed to set binaryType on terminal socket', e)
        }

        if (terminalSocket.readyState === WebSocket.OPEN) {
          attachTerminal()
        } else {
          terminalSocket.addEventListener('open', attachTerminal, { once: true })
        }
      }


      return () => {
        window.removeEventListener('resize', handleResize)
        try {
          resizeObserver.disconnect()
        } catch (e) {}
        if (terminalSocket) {
          terminalSocket.removeEventListener('open', attachTerminal)
        }
        try {
          if (attachAddon) {
            attachAddon.dispose()
          }
        } catch (e) {}
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
          height:'100%',
          width:'100%',
          minHeight:'220px',
          minWidth:0,
          overflow:'hidden',
          backgroundColor:'#282a37',
        }}
        className="terminal"
        id='terminal-container'
      >

      </div>
  )
}

export default BrowserTerminal 
