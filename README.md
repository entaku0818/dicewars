# DICEWARS

サイコロを使った領土征服型ストラテジーゲーム

## 概要

DICEWARSは、シンプルなルールで奥深い戦略性を楽しめるターン制の対戦ボードゲームです。  
プレイヤーは自分の領土からサイコロを使って隣接する敵領土を攻撃し、全ての領土を征服することを目指します。

## 特徴

- 🎲 **シンプルなサイコロバトル** - 攻撃側と防御側がサイコロを振って勝負
- 🌍 **多様なマップ** - 小（15領土）〜大（50領土）まで選択可能
- ⚡ **スピーディーな対戦** - 制限時間モードで緊張感のあるバトル
- 🤖 **多彩なAI** - 攻撃的/防御的/策略的な3種類のAIと対戦
- 👥 **最大8人対戦** - 友達と一緒にカジュアルに楽しめる
- 🌐 **クロスプラットフォーム** - Web/iOS/Androidで同じ体験

## ゲームルール

### 基本ルール
1. **領土とサイコロ**
   - 各領土には1〜8個のサイコロを配置可能
   - 隣接する領土にのみ攻撃可能

2. **攻撃システム**
   - 攻撃側と防御側が全サイコロを振る
   - 合計値が高い方が勝利
   - 攻撃成功：サイコロ-1個を征服地に移動
   - 防御成功：攻撃側は1個だけ残る

3. **ターンの流れ**
   - 攻撃フェーズ：好きなだけ攻撃
   - 補充フェーズ：連続領土数に応じてサイコロ獲得
   - 配置フェーズ：獲得サイコロを配置

### 勝利条件
- 全領土を征服
- 制限ターン終了時に最多領土保有

## 追加要素

### 特殊地形
- **山岳** - 防御時サイコロ+1
- **河川** - 攻撃時サイコロ-1  
- **要塞** - 最大10個までサイコロ配置可能

### スキルカード
- **増援** - 即座にサイコロ3個獲得
- **奇襲** - 攻撃時サイコロ+2
- **防壁** - 防御時サイコロ+2

## 技術スタック

- **フレームワーク**: React Native + TypeScript
- **Web対応**: React Native Web
- **状態管理**: Redux Toolkit
- **リアルタイム通信**: Socket.io
- **アニメーション**: React Native Reanimated 3
- **UI**: React Native Paper (Material Design)

## セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/dicewars.git
cd dicewars

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start

# プラットフォーム別の起動
npm run ios      # iOS
npm run android  # Android  
npm run web      # Web
```

## 開発ロードマップ

### Phase 1: MVP版 (1-2ヶ月)
- [x] ゲーム仕様策定
- [ ] 基本ゲームロジック実装
- [ ] ローカルAI対戦
- [ ] Web版リリース

### Phase 2: オンライン対戦 (2-3ヶ月)
- [ ] マルチプレイヤー機能
- [ ] ルーム作成/参加
- [ ] リアルタイム同期
- [ ] モバイルアプリリリース

### Phase 3: 機能拡張 (3-4ヶ月)
- [ ] スキルカードシステム
- [ ] 特殊地形実装
- [ ] カスタマイズ要素
- [ ] Steam版展開

## ビルド

```bash
# Web版ビルド
npm run build:web

# モバイルアプリビルド (EAS)
eas build --platform ios
eas build --platform android

# ローカルビルド
npm run build:ios
npm run build:android
```

## テスト

```bash
# ユニットテスト
npm test

# E2Eテスト
npm run test:e2e
```

## コントリビュート

プルリクエストは大歓迎です！  
大きな変更の場合は、まずissueを開いて変更内容について議論してください。

## ライセンス

[MIT](LICENSE)

## お問い合わせ

- Issue: [GitHub Issues](https://github.com/yourusername/dicewars/issues)
- Discord: [Community Server](https://discord.gg/yourinvite)

---

🎲 **Let the dice decide your fate!**