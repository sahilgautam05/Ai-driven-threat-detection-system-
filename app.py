import streamlit as st
import os
import re

# Configure wide layout and hide sidebar
st.set_page_config(
    page_title="Sentinel AI - Security Operations Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Fullscreen styling override
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

def bundle_html():
    workspace = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Read index.html
    html_path = os.path.join(workspace, "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
        
    # 2. Read index.css
    css_path = os.path.join(workspace, "index.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()
        
    # Inline the CSS by replacing the link tag (using literal replace to avoid regex escapes)
    html = html.replace(
        '<link rel="stylesheet" href="index.css">',
        f'<style>\n{css}\n</style>'
    )
    
    # 3. Read and concatenate Javascript modules in dependency order
    js_files = [
        "src/data.js",
        "src/state.js",
        "src/components/utils.js",
        "src/components/sidebar.js",
        "src/components/dashboard.js",
        "src/components/detections.js",
        "src/components/investigation.js",
        "src/components/copilot.js",
        "src/components/assets.js",
        "src/components/network.js",
        "src/components/intel.js",
        "src/components/rules.js",
        "src/components/reports.js",
        "src/components/notifications.js",
        "src/components/commands.js",
        "app.js"
    ]
    
    js_bundle = []
    for js_file in js_files:
        path = os.path.join(workspace, js_file)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                
                # Remove ES6 imports so all modules share a unified script scope
                content = re.sub(r'import\s+[\s\S]*?\s+from\s+[\'"].*?[\'"];?', '', content)
                
                # Remove ES6 exports but retain the declarations
                content = re.sub(r'\bexport\s+default\s+\w+;?', '', content)
                content = re.sub(r'\bexport\s+(const|let|var|class|function)\b', r'\1', content)
                
                js_bundle.append(f"// --- {js_file} ---\n{content}\n")
                
    combined_js = "\n".join(js_bundle)
    
    # Inline the JavaScript bundle by replacing the module script tag (using literal replace)
    html = html.replace(
        '<script type="module" src="app.js"></script>',
        f'<script>\n{combined_js}\n</script>'
    )
    
    return html

# Bundle the files and render the standalone HTML inside Streamlit
try:
    bundled_html = bundle_html()
    st.components.v1.html(bundled_html, height=1000, scrolling=True)
except Exception as e:
    st.error(f"Error bundling application: {str(e)}")
