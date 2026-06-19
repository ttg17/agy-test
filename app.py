from flask import Flask, jsonify, render_template
import urllib.request
import xml.etree.ElementTree as ET
import html
import re

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_feed():
    try:
        req = urllib.request.Request(
            FEED_URL, 
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
        
        root = ET.fromstring(xml_data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        entries = []
        for entry_elem in root.findall('atom:entry', ns):
            title_elem = entry_elem.find('atom:title', ns)
            updated_elem = entry_elem.find('atom:updated', ns)
            link_elem = entry_elem.find('atom:link', ns)
            content_elem = entry_elem.find('atom:content', ns)
            
            title = title_elem.text if title_elem is not None else "Unknown Date"
            updated = updated_elem.text if updated_elem is not None else ""
            link = link_elem.attrib.get('href') if link_elem is not None else ""
            
            content_html = ""
            if content_elem is not None:
                # Atom content is html encoded
                content_html = content_elem.text or ""
                
            entries.append({
                "title": title,
                "updated": updated,
                "link": link,
                "content": content_html
            })
            
        return {"status": "success", "data": entries}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/releases")
def api_releases():
    result = fetch_and_parse_feed()
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
