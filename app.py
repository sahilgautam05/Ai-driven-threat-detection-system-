import streamlit as st
import threading
import http.server
import socketserver
import socket
import os

# Set wide layout and tab configurations
st.set_page_config(
    page_title="Sentinel AI - Security Operations Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Premium CSS reset to hide Streamlit components and make the iframe fullscreen
st.markdown("""
    <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .block-container {
            padding-top: 0rem;
            padding-bottom: 0rem;
            padding-left: 0rem;
            padding-right: 0rem;
        }
        iframe {
            border: none;
            width: 100%;
            height: 100vh;
        }
        div[data-testid="stVerticalBlock"] {
            gap: 0rem;
        }
    </style>
""", unsafe_allow_html=True)

# Helper function to find an open network port dynamically
def find_free_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

# Launch local static files server on a background thread
if 'server_port' not in st.session_state:
    port = find_free_port()
    st.session_state.server_port = port
    
    def start_http_server():
        class SilentHandler(http.server.SimpleHTTPRequestHandler):
            def log_message(self, format, *args):
                # Suppress printing request logs to terminal to keep logs clean
                pass
        
        # Change working directory to this script's folder to serve correct assets
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        with socketserver.TCPServer(("", port), SilentHandler) as httpd:
            httpd.serve_forever()
            
    thread = threading.Thread(target=start_http_server, daemon=True)
    thread.start()

# Embed the Sentinel AI dashboard in the main container
st.components.v1.iframe(
    src=f"http://localhost:{st.session_state.server_port}/index.html",
    height=900
)
