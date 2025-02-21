markdown
# 👨🏽‍💻CodeGuide - AI-Powered Code Explainer

## 📌 About
CodeGuide is a **Chrome extension** that provides **AI-generated explanations** for code snippets on web pages using **FastAPI** and **LangChain**.

![CodeGuide Banner](images/codeGuide.png)

---

## 🛠️ Installation Guide

### **1️⃣ Download & Install**
1. Clone the repository:
   ```bash
   git clone https://github.com/dineshram0212/codeguide.git
   cd codeguide
   ```

### **2️⃣ Running the Backend**
Run the **provided EXE file** for an easy setup:
1. Download `codeguide_backend.exe` from **backend**.
2. **Double-click to run** it.
3. The backend will start at:
   ```
   http://localhost:8000
   ```

### **3️⃣ Load the Chrome Extension**
1. Open **Chrome** and go to:
   ```
   chrome://extensions/
   ```
2. Enable **Developer Mode** (top-right corner).
3. Click **"Load Unpacked"** and select the `codeguide/` folder.

---

## 🔄 **Switching API Endpoints**
Modify the API URL in **`config.js`** to switch between local and deployed servers:
```javascript
window.API_BASE_URL = "http://localhost:8000";  // Change to production if needed
```
Then **reload the extension** in `chrome://extensions/`.

---

## 📧 Contact / Credits
- **GitHub:** [dineshram0212](https://github.com/dineshram0212)
- **Email:** [dineshramdsml@gmail.com]
- **Website:** [https://dineshram.vercel.app/](https://dineshram.vercel.app/)

---

**🚀 Try CodeGuide today and get AI-powered code explanations instantly!**