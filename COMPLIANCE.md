# 合規與治理聲明 / Compliance and Governance Statement

**生效日期 / Effective Date:** 2026-10
**專案名稱 / Project:** 童心默書 KidsDictate
**架構類型 / Architecture:** 100% Client-Side / Static-First Web Application

---

## 1. 核心合規聲明 / Executive Summary

**[ZH]** 本專案貫徹「隱私優先設計（Privacy by Design）」原則。所有光學字元辨識（OCR）與語音合成（TTS）運算均於使用者的終端設備（Edge Device）記憶體內完成。**本系統不包含後端伺服器、不收集、不儲存、亦不傳輸任何個人資料（PII）或使用數據。**

**[EN]** This project strictly implements the "Privacy by Design" principle. All Optical Character Recognition (OCR) and Text-to-Speech (TTS) processes are executed entirely within the volatile memory of the user's edge device. **This system operates without backend servers, and does not collect, store, or transmit any Personally Identifiable Information (PII) or telemetry data.**

---

## 2. 隱私法規適用性 / Privacy Regulations Applicability

### 2.1 香港個人資料（私隱）條例 (HK PCPD) & 歐盟一般資料保護規則 (GDPR)
*   **[ZH] 不適用且先天合規：** 鑑於本系統具備「零資料收集（Zero Data Collection）」與「零資料滯留（Zero Data Retention）」特性，開發者未扮演「資料控制者（Data Controller）」或「資料處理者（Data Processor）」的角色。本專案從架構層面直接滿足 GDPR 第 5 條（資料最小化）及 PCPD 的資料保護原則（DPPs）。
*   **[EN] N/A & Inherently Compliant:** Given the "Zero Data Collection" and "Zero Data Retention" nature of the architecture, the developer acts neither as a Data Controller nor a Data Processor. The project inherently satisfies GDPR Article 5 (Data Minimization) and HK PCPD's Data Protection Principles (DPPs) at the architectural level.

### 2.2 國家網信辦 (CAC) 相關數據出境與隱私規定
*   **[ZH] 不適用：** 本系統不涉及任何數據的伺服器傳輸或跨境數據流動（Cross-border Data Transfer），故不在《數據出境安全評估辦法》及相關個資保護法（PIPL）的申報與管轄範圍內。
*   **[EN] N/A:** The system involves no server transmission or cross-border data transfer, operating entirely outside the scope of the CAC’s data export security assessments and the Personal Information Protection Law (PIPL).

---

## 3. 人工智能治理與法規 / AI Governance and Regulations

### 3.1 歐盟人工智能法案 (EU AI Act)
*   **[ZH] 不適用（極低風險/豁免）：** 本系統內建的光學辨識（Tesseract.js）屬於傳統、透明且具確定性的模式識別軟體，不具備自主學習能力，亦不涉及生物特徵識別或關鍵基礎設施決策。根據 EU AI Act 規定，此類工具屬於極低風險或豁免類別，無須進行合格評定（Conformity Assessment）。
*   **[EN] N/A (Minimal Risk/Exempt):** The integrated OCR (Tesseract.js) is a traditional, transparent, deterministic pattern-matching software without autonomous learning capabilities, biometric identification, or critical infrastructure decision-making functions. Under the EU AI Act, such tools fall under the minimal risk or exempt categories, requiring no conformity assessments.

### 3.2 第三方生成式 AI 責任切割 (Generative AI Disclaimer)
*   **[ZH] 使用者責任：** 本系統提供的「AI 輔助提示詞（Prompt）」功能僅為文字生成範本。若使用者選擇複製該提示詞並前往第三方的生成式 AI 平台（如 ChatGPT, Claude, 百度文心一言等）處理圖片，**該行為屬於使用者與第三方平台之間的獨立協議**。開發者對第三方平台的資料處理方式、生成結果之準確性及合規性（包含但不限於幻覺風險與演算法偏見）概不負責。
*   **[EN] User Responsibility:** The "AI Assistant Prompt" feature provided by this system is strictly a text template. Should the user choose to copy this prompt and process their images on third-party Generative AI platforms (e.g., ChatGPT, Claude, Ernie Bot), **this constitutes an independent agreement between the user and the third-party platform**. The developer bears no liability for the data processing practices, accuracy, or compliance (including hallucination risks and algorithmic bias) of these external platforms.

---

## 4. 國際標準對齊 (ISO Standards Alignment)

儘管作為開源客戶端專案，本專案無須進行正式的 ISO 認證，但系統架構嚴格遵循以下標準之核心精神設計：
Although formal ISO certification is not required for an open-source client-side project, the system architecture rigorously aligns with the core principles of the following standards:

*   **ISO/IEC 27001 (Information Security Management):**
    *   **[ZH]** 透過嚴格的內容安全策略（CSP），禁用 `unsafe-inline` 腳本，防禦 XSS 攻擊，確保前端應用的完整性。
    *   **[EN]** Ensures application integrity against XSS attacks via a strict Content Security Policy (CSP) that disables `unsafe-inline` scripts.
*   **ISO/IEC 27701 (Privacy Information Management):**
    *   **[ZH]** 達成「隱私預設（Privacy by Default）」，無需使用者提供同意書（Consent），因系統在物理上無法存取或遙測使用者的終端數據。
    *   **[EN]** Achieves "Privacy by Default," eliminating the need for user consent as the system physically cannot access or exfiltrate endpoint data.
*   **ISO/IEC 42001 (Artificial Intelligence Management System):**
    *   **[ZH] 透明度與風險揭露：** 在使用者介面中誠實聲明本機 OCR 引擎的技術限制（如無法處理複雜排版），並提供清晰的外部 AI 替代方案，完全符合 AI 系統透明度與風險告知的管理要求。
    *   **[EN] Transparency & Risk Disclosure:** Honestly declares the technical limitations of the local OCR engine (e.g., inability to handle complex layouts) in the UI, providing a clear external AI alternative, fully complying with AI transparency and risk notification requirements.

---

## 5. 聯絡與開源審計 / Contact & Audit

**[ZH]** 本專案為 100% 開源軟體。所有原始碼均可於 GitHub 進行公開安全審計。使用者及安全研究人員可自由檢視程式碼，以驗證本文件所述之「零資料上傳」宣告。
**[EN]** This project is 100% open-source. All source code is available on GitHub for public security auditing. Users and security researchers are encouraged to review the code to independently verify the "Zero Data Upload" claims stated in this document.
