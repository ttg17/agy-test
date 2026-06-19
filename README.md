# BigQuery Release Notes Dashboard

A premium, modern web dashboard built with **Python Flask** and plain **Vanilla HTML, CSS, and JavaScript** that aggregates, parses, and displays the latest Google Cloud BigQuery Release Notes. It allows developers to browse updates seamlessly and tweet about specific releases with a single click.

---

## 🚀 Features

* **Real-time Integration**: Pulls live data from the official Google Cloud BigQuery RSS/Atom release feed.
* **Modern Dark Aesthetics**: Premium UI featuring glassmorphic panel elements, visual feedback on hover, and smooth CSS animations.
* **Seamless Updates**: Refresh the release notes anytime with a button including an animated loading state spinner.
* **Quick Share**: Select any specific release and share it directly on Twitter/X using automated character-limit-safe web intents.
* **Responsive Layout**: Adapts gracefully to all screen resolutions (mobile, tablet, and desktop displays) using CSS Grid and Flexbox.

---

## 📂 Project Structure

* [app.py](file:///C:/Users/QC/desktop/agy-cli-projects/cliproject/app.py) - Flask application serving routes, styling assets, and parsing the Atom XML feed.
* [templates/index.html](file:///C:/Users/QC/desktop/agy-cli-projects/cliproject/templates/index.html) - Structural markup featuring semantic HTML5 tags and FontAwesome symbols.
* [static/css/style.css](file:///C:/Users/QC/desktop/agy-cli-projects/cliproject/static/css/style.css) - Fine-tuned dark theme stylesheet detailing the UI appearance.
* [static/js/main.js](file:///C:/Users/QC/desktop/agy-cli-projects/cliproject/static/js/main.js) - Application controller managing API request lifecycles, DOM updates, and social intents.
* [requirements.txt](file:///C:/Users/QC/desktop/agy-cli-projects/cliproject/requirements.txt) - Python dependencies list.
* [.gitignore](file:///C:/Users/QC/desktop/agy-cli-projects/cliproject/.gitignore) - Rules to prevent local environment caches from entering repository commits.

---

## 🛠️ Installation & Execution

### Prerequisites
* Python 3.8 or higher.
* Git.

### Setup Steps
1. Clone the repository to your machine:
   ```bash
   git clone https://github.com/ttg17/agy-test.git
   cd agy-test
   ```

2. Install the necessary packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch the development server:
   ```bash
   python app.py
   ```

4. Open the application:
   Navigate to **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in your browser.
