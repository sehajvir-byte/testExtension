Inclusive Canvas is a Chrome Extension designed to dismantle the digital barriers in higher education. Built for the DivE Social Good Prize, it transforms the standard University of Alberta Canvas interface into a personalized, accessible dashboard tailored for neurodivergent and disabled students.

🌟 The Problem
Standard Learning Management Systems (LMS) are often overwhelming. For students with ADHD, the cluttered sidebars are a constant source of distraction. For students with Dyslexia, the default fonts are difficult to parse. For the Visually Impaired, high-contrast and layout stability are essential for success.

🚀 Key Features
ADHD Focus Mode: Instantly strips away distracting sidebars and centers course content to reduce cognitive load.

Dyslexia-Friendly Typography: One-click font swapping to OpenDyslexic, designed specifically to increase readability and reduce letter-flipping.

High-Contrast Profiles: Specialized CSS filters to assist students with color-blindness or low vision.

Smart Document Scanner: Automatically extracts scattered PDF and file links from course modules into a clean, easy-to-access list.

Secure Integration: Uses the official Canvas API and chrome.storage to handle student data locally and securely.

🛠️ Technical Stack
Frontend: React + TypeScript for a fast, responsive UI.

Core: Chrome Extension API (Manifest V3).

Communication: Asynchronous message passing between Popup, Background Service Workers, and Content Scripts.

Styling: Dynamic CSS Injection for real-time page transformation.

⚙️ Installation & Setup
Clone this repository.

Run npm install and npm run build.

Open Chrome and navigate to chrome://extensions/.

Enable Developer Mode and click Load Unpacked.

Select the dist folder.

Open any Canvas course at uofa.instructure.com and click the extension icon to begin!
