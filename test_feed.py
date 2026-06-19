import urllib.request
import xml.etree.ElementTree as ET

url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
try:
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    with urllib.request.urlopen(req) as response:
        xml_data = response.read()
    
    root = ET.fromstring(xml_data)
    
    # namespaces
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    
    print("Feed Title:", root.find('atom:title', ns).text)
    
    entries = root.findall('atom:entry', ns)
    print("Number of entries:", len(entries))
    if entries:
        first = entries[0]
        print("First Entry Title:", first.find('atom:title', ns).text)
        print("First Entry Updated:", first.find('atom:updated', ns).text)
        print("First Entry Link:", first.find('atom:link', ns).attrib.get('href'))
        content = first.find('atom:content', ns)
        if content is not None:
            print("Content type:", content.attrib.get('type'))
            print("Content preview:", content.text[:200] if content.text else "None")
except Exception as e:
    print("Error:", e)
