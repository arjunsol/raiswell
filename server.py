#!/usr/bin/env python3
"""
Simple HTTP Server for Colin's Building Website
Serves the website locally to avoid CORS issues

Usage:
    python server.py

Then open: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 80

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🌐 Colin's Building Website Server")
            print(f"📍 Serving at: http://localhost:{PORT}")
            print(f"📁 Directory: {os.getcwd()}")
            print(f"🔄 Press Ctrl+C to stop the server")
            print(f"")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print(f"✅ Browser opened automatically")
            except:
                print(f"⚠️  Please open http://localhost:{PORT} in your browser")
            
            print(f"")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048:  # Port already in use on Windows
            print(f"❌ Port {PORT} is already in use. Try a different port or close other servers.")
            print(f"💡 You can also try: python server.py --port 8001")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()