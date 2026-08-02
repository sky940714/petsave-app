# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PetSave 派遣系統 Demo**——動物救援勤務派遣管理系統的 Expo App，展示值班台/出勤人員/管理端三種角色如何協作處理救援案件。目前是**公開上架 App Store 的展示原型**（App 名稱刻意帶「Demo」字樣），不是正式營運服務。

姊妹 repo `petsave-backend`（Express + MySQL）是真正的後端，但這個 App **目前預設完全不連它**：`constants/Config.ts` 的 `MOCK_MODE = true`，所有 API 呼叫都被 `utils/api.ts` 攔截，改由 `mock/mockApi.ts` + `mock/mockStore.ts`（記憶體資料庫，重開 App 會回復初始 fixtures）處理。要接上真後端，把 `MOCK_MODE` 改成 `false` 並確認 `API_BASE_URL` 指向正確位置。

## Commands

```bash
npx expo start              # 開發伺服器（QR code，手機用 Expo Go）
npx expo start --web        # 網頁版
npx tsc --noEmit             # 型別檢查
npx expo export --platform ios   # 驗證原生打包不會出錯（不需要 Mac/Xcode）
npx expo export --platform web
npx expo-doctor              # 專案健康檢查
```

## Architecture

- `app/` — Expo Router file-based routing。`app/login.tsx` 提供三個「一鍵扮演角色」demo 按鈕（`mock/mockStore.ts` 的 `loginAsRole()`），不是帳密登入
- `app/(dispatcher)/`、`app/(staff)/`、`app/(admin)/` — 三個角色各自的路由群組，`hooks/useRoleGuard.tsx` 做角色守衛
- `app/(staff)/(tabs)/` — 出勤人員用懸浮玻璃擬態 Tab Bar（`expo-blur` + Reanimated 滑塊動畫），案件/歷史/自己三個分頁
- `mock/` — 展示模式的核心：`fixtures.ts`（初始假資料）、`mockStore.ts`（業務邏輯，含案件狀態機、驗證規則，刻意跟後端 `caseService.ts` 邏輯對齊）、`mockApi.ts`（依 URL pattern 分派到 mockStore，模擬 REST API）
- `components/RealMapView.native.tsx` / `.web.tsx` / `.tsx` — 平台分流地圖元件。原生用 `react-native-maps`（iOS 用 Apple 地圖免金鑰，Android 用 Google 地圖需在 `app.json` 填 API key），網頁版退回 `DemoMapView.tsx`（SVG 手繪示意地圖，因為 react-native-maps 不支援 web）。**注意**：`RealMapView.tsx`（無平台後綴）只是給 TypeScript 型別檢查用的替身，Metro 實際上永遠會選 `.native`/`.web` 版本，不要以為改那個檔案會影響執行結果
- `components/OnboardingTour.tsx` — 通用導覽卡片元件，值班台跟出勤人員首頁都各自接了一組步驟，用 `AsyncStorage` 記錄「看過了沒」

### 案件狀態機（跟後端邏輯一致）

`received → dispatched → acknowledged → in_progress → closed`。標準結案需三類照片齊全，例外結案（值班台發起）可跳過中間狀態直接結案。

### 通知（本機推播，不是真推播）

`expo-notifications` 的 local notification，不需要後端。Expo Go 從 SDK 53 開始**不支援遠端推播**，但本機通知完全正常。`app/_layout.tsx` 有全域的 `addNotificationResponseReceivedListener`，依「目前登入裝置的角色」決定點通知後導去哪裡（因為展示模式沒有真正跨裝置同步，同一支通知在誰的裝置上點開就導去誰的畫面）；`data.flow === 'experience'` 的通知會被這個全域監聽器跳過，改由 `(staff)/(tabs)/index.tsx` 自己的監聽器接手開啟滑動受理視窗。

## App Store 上架狀態（重要，接手前先看）

- Bundle ID：`com.petsave.app`，EAS 專案：`@jerry94714/petsave-app`（`app.json` 的 `extra.eas.projectId`）
- App Store Connect App：Apple ID `6796384735`
- 隱私權政策／支援頁面：發布在 Claude Artifact（連結見團隊紀錄，非本 repo 內檔案）
- **`eas.json` 裡的 `submit.production.ios.ascAppId` 已經寫死指向上面那個 ASC App**，如果要上架成另一個 App 記錄要記得改
- iOS build 需要 Apple Developer 帳號登入才能設定簽署憑證（Distribution Certificate / Provisioning Profile），這步驟必須在有真人操作、能輸入 Apple ID + 兩步驟驗證碼的終端機裡跑一次：
  ```bash
  npx eas-cli build --platform ios --profile production
  ```
  跑過一次後，憑證會存在 EAS 伺服器上，之後可以加 `--non-interactive` 跑。`eas submit` 同理，第一次要跑過 App Store Connect API Key 設定（選 "Add a new key"）。
- **已知坑**：`package-lock.json` 曾經跟 `package.json` 對不上（缺 `@emnapi/core`/`@emnapi/runtime`），導致 EAS build 的 `npm ci` 失敗。如果又遇到類似錯誤，刪掉 `node_modules` + `package-lock.json` 重新 `npm install` 通常能修好；記得在真的送 build 前先本機跑一次 `npm ci` 模擬 EAS 的行為。
- EAS 免費方案排隊時間不固定，`eas submit` 本機監看指令若斷網會報錯（`getaddrinfo ENOTFOUND api.expo.dev`），但那只是本機監看失敗，**伺服器端的提交工作不受影響**，可用 `npx eas-cli workflow:runs --json` 查最新 workflow 狀態確認。

## MVP 範圍外（Phase 2，尚未實作）

真實後端串接、統計報表視覺化、三聯單 PDF 匯出、跨裝置真推播（需要接上 `petsave-backend` + Expo Push Service）。
