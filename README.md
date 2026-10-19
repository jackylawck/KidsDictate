# 童心默書 KidsDictate

> 專為香港學童設計的本機離線默書小助手  
> *A Privacy-First, Offline-Capable Dictation Assistant for Primary School Kids.*

[![GitHub Pages](https://img.shields.io/badge/deployment-GitHub%20Pages-blue.svg)](https://jackylawck.github.io/KidsDictate/)
[![Compliance: High](https://img.shields.io/badge/Compliance-PCPD%20%7C%20GDPR%20%7C%20ISO--Aligned-success.svg)](COMPLIANCE.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Architecture: Client-Side Only](https://img.shields.io/badge/Architecture-Client--Side%20Only-purple.svg)]()
[![Privacy: Zero Data Retention](https://img.shields.io/badge/Privacy-Zero%20Data%20Retention-orange.svg)]()

---

### 👨‍👦 關於本專案 (About This Project)

#### 繁體中文
這是我為了陪伴兒子準備默書而開發的非商業個人專案！為了提升孩子的學習樂趣，我親手打造了這個結合邊緣光學辨識（Edge OCR）、Web Speech 語音合成與嚴格隱私架構的輔助工具。

無論是英文生字還是中文（粵語/普通話）詞語，您可以直接手動輸入，或用手機拍下簡單的默書範圍，系統就能在設備本地完成處理並自動為孩子朗讀。希望透過這個安全、流暢且無廣告的工具，能讓孩子在默書練習中建立自信，共同寫下無價的親子陪伴回憶！

#### English
This is a non-commercial, personal project developed to accompany my son in preparing for his dictation tests! To make learning more enjoyable, I personally engineered this assistive tool that combines Edge OCR, Web Speech synthesis, and a strict privacy-first architecture.

Whether it's English vocabulary or Chinese (Cantonese/Mandarin) phrases, you can manually input the text or simply snap a photo of a simple dictation list. The system processes the text entirely on-device and dictates it automatically. I hope this safe, smooth, and ad-free application helps children build confidence in their dictation practice, creating priceless parent-child memories together!

---

## 繁體中文說明 (Traditional Chinese)

### 🌟 項目願景與理念
**KidsDictate（童心默書）** 是一個以純前端靜態架構（Static-First）驅動的智能默書工具。

市面上許多學習應用程式往往需要將相片或文字上傳至雲端伺服器進行處理，這引發了潛在的隱私與資料外洩疑慮。KidsDictate 貫徹 **Privacy-by-Design** 原則，運用 WebAssembly (WASM) 與本機瀏覽器 API，確保所有的運算、光學字元辨識（OCR）與語音合成（TTS）都在使用者的設備（手機或平板）記憶體內完成。**零資料上傳、無追蹤碼、完全保護學童隱私。**

---

### 🛡️ 合規與治理 (Compliance & Governance)
本專案採用極致的「隱私預設 (Privacy by Default)」架構，先天符合香港個人資料（私隱）條例 (HK PCPD) 及歐盟 GDPR 之資料最小化原則，並對齊 ISO/IEC 27001, 27701 及 42001 之核心精神。

關於系統免責聲明、第三方生成式 AI 責任劃分與完整治理規範，請參閱我們的 **[合規與治理聲明 (COMPLIANCE.md)](COMPLIANCE.md)**。

---

### ✨ 核心功能與特色

1. **邊緣光學字元辨識 (Edge OCR) 與 AI 逃生門**
   - 內建 `Tesseract.js` WebAssembly 核心，支援即時的本機圖片轉文字功能。
   - **誠實的系統限制與 AI 輔助**：為堅守不將相片上傳伺服器的隱私底線，本機 OCR 引擎在面對複雜版面（如中英拼音夾雜、手寫塗鴉、複雜插圖）時能力有限。為此，系統特別提供「AI 輔助提示詞」的一鍵複製功能，引導家長使用自己的外部 AI 工具（如 ChatGPT/Claude）來處理極限情境。

2. **智慧語音狀態機 (Smart Speech Engine)**
   - 深度整合 Web Speech API，支援多語系（**粵語、普通話、US/UK 英文**）動態切換。
   - 具備防抖與中斷恢復機制的非同步語音佇列管理，提供家長自訂「重複次數」、「語速」及「書寫停頓倒數」，完美模擬真實默書情境。

3. **零資料滯留與極限防禦 (Zero-Data Retention & Strict Security)**
   - **完全靜態**：無後端資料庫，無 Cookie，無任何 Telemetry 遙測數據收集。
   - **資安護城河**：實施最嚴格的內容安全策略（CSP），禁用 `unsafe-inline` 腳本與樣式，徹底杜絕 XSS 漏洞，並為未來的 PWA 離線化（Service Worker）鋪路。

4. **型別安全的雙語系統與無障礙設計 (Type-Safe i18n & a11y)**
   - 核心字典檔採用 TypeScript 泛型斷言（`_CheckKeys`）進行編譯期檢查，保證中英雙語 Key 完全對稱，杜絕執行期遺漏。
   - 支援原生 Safe Area（適配 iPhone 瀏海與底部橫條），且完全符合 WCAG 無障礙標準，保留使用者自由縮放（Zoom）的權利。

---

### 🛠 技術架構與技術棧

- **前端核心**：Vanilla JavaScript (ES Modules)
- **型別檢查**：TypeScript (專注於 `i18n` 核心與模組防禦)
- **樣式框架**：[Tailwind CSS](https://tailwindcss.com/)
- **光學辨識**：[Tesseract.js](https://tesseract.projectnaptha.com/) (WebAssembly + Web Worker)
- **自動化建置**：`concurrently` + `rimraf` 跨平台建置腳本
- **持續部署**：GitHub Actions + GitHub Pages (純靜態託管)

---

### 🚀 快速開始與本地開發

#### 1. 安裝環境需求
- Node.js >= 20.0.0
- npm >= 10.0.0

#### 2. 下載依賴與啟動
```bash
# 安裝相依套件 (包含 TypeScript, Tailwind 與並行建置工具)
npm install

# 啟動本地開發模式 (同步監聽 TS 與 Tailwind CSS 變更)
npm run dev

```

#### 3. 生產環境建置

```bash
# 執行安全清理並編譯生產環境代碼
npm run build

# 在本地預覽建置產物
npm run serve

```

---

## English Documentation

### 🌟 Mission & Philosophy

**KidsDictate** is a client-side, Static-First smart dictation tool.

Many educational apps on the market require users to upload photos or text to cloud servers for processing, raising significant privacy and data leakage concerns. KidsDictate is engineered with **Privacy-by-Design** at its core. By leveraging WebAssembly (WASM) and native browser APIs, all computations, Optical Character Recognition (OCR), and Text-to-Speech (TTS) processes are executed entirely within the device's memory. **Zero data upload, zero tracking codes, and absolute protection of children's privacy.**

---

### 🛡️ Compliance & Governance

This project employs a strict "Privacy by Default" architecture, inherently complying with the HK PCPD and EU GDPR data minimization principles, while aligning with the core spirit of ISO/IEC 27001, 27701, and 42001.

For system disclaimers, delineation of third-party Generative AI liabilities, and complete governance policies, please review our **[Compliance and Governance Statement (COMPLIANCE.md)](COMPLIANCE.md)**.

---

### ✨ Key Features

1. **Edge Optical Character Recognition (Edge OCR) & AI Fallback**
* Powered by a self-hosted `Tesseract.js` WebAssembly core for strictly on-device image-to-text processing.
* **Honest Limitations & AI Assistant**: To uphold our strict zero-upload privacy promise, the local scanning engine is naturally limited when facing complex layouts (e.g., mixed pinyin, handwriting, complex backgrounds). For these edge cases, the app provides a 1-click prompt generator, empowering parents to securely use their preferred external AI (like ChatGPT/Claude) without compromising the app's privacy integrity.


2. **Smart Speech State Machine**
* Deep integration with the Web Speech API, supporting dynamic multi-language switching (**Cantonese, Mandarin, US English, UK English**).
* Features an asynchronous speech queue with robust interrupt recovery, allowing parents to customize "Repetitions", "Speech Rate", and "Writing Pause Countdown" to perfectly simulate a real dictation environment.


3. **Zero-Data Retention & Strict Security**
* **100% Client-Side**: No backend databases, no cookies, and absolutely no telemetry data collection.
* **Security Moat**: Implements a highly restrictive Content Security Policy (CSP), banning all `unsafe-inline` scripts/styles to eradicate XSS vulnerabilities, while fully supporting PWA offline capabilities (ready for Service Workers).


4. **Type-Safe Bilingual System & Accessibility (a11y)**
* The core dictionary utilizes advanced TypeScript generic assertions (`_CheckKeys`) for compile-time validation, guaranteeing perfect symmetry between Traditional Chinese and English keys to prevent runtime omissions.
* Features native Safe Area support (adapting to iPhone notches and home indicators) and strictly adheres to WCAG accessibility standards, preserving the user's freedom to pinch-to-zoom.



---

### 🛠 Technology Stack

* **Frontend Core**: Vanilla JavaScript (ES Modules)
* **Type Checking**: TypeScript (Focused on `i18n` core and module defense)
* **Styling**: Tailwind CSS
* **OCR Engine**: Tesseract.js (WebAssembly + Web Worker)
* **Build Tooling**: `concurrently` + `rimraf` for cross-platform build scripts
* **CI/CD Pipeline**: GitHub Actions & GitHub Pages (Static Hosting)

---

### 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (Watch mode for TS & Tailwind)
npm run dev

# 3. Build for production (Includes clean-up routine)
npm run build

# 4. Preview production build locally
npm run serve

```

---

### 📄 License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).

