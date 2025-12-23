
# OMNI-GRID // KNOWLEDGE BASE

## 1. The "Smart Grid" Archetype

The Smart Grid is not just a UI layout; it is a strategic philosophy for asset management. It treats **connectivity** and **value transfer** as a single vertical.

*   **Physical Layer (NOK):** Infrastructure hardware.
*   **Liquidity Layer (USDT):** 24/7 settlement rails.
*   **Logic Layer (ETH/SOL):** Smart contract execution environments.
*   **Macro Layer (BTC):** The sovereign debt hedge.

The dashboard facilitates "Programmable Trading" via the **Asset Command** widget, allowing users to define IF/THEN logic based on these layers.

## 2. Neural Link (AI Integration)

Omni-Grid uses a direct "Neural Link" to Google's Gemini models. 

*   **Model:** `gemini-3-flash-preview` is used for high-speed tasks (Summarization, Translation).
*   **Model:** `gemini-3-pro-preview` is used for complex logic (Code Generation in Widget Architect).
*   **Privacy:** Requests are sent directly from the client browser to Google's API. No intermediate server stores your prompts.

## 3. Cross-Talk Protocol

The application implements a `Drag & Drop` event bus known as **Cross-Talk**. This allows widgets to communicate intent without direct state coupling.

**Example Flow:**
1.  **Universal Transformer:** Convert CSV to JSON.
2.  **Action:** User drags the JSON output.
3.  **Target:** User drops onto **Neural Scratchpad**.
4.  **Result:** The Scratchpad detects the data type and automatically formats/analyzes the JSON using AI.

## 4. Local Persistence

Omni-Grid follows a "Local-First" dogma.
*   **Layouts:** Saved to `omni-grid-storage` in LocalStorage.
*   **Content:** Scratchpads, tasks, and settings are persisted locally.
*   **Backup:** Users can export their entire state as a JSON file via the global header.
