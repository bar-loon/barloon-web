# Barloonのサイト

## これは何？

[BarloonのNotion](https://www.notion.so/Barloon-bbe264ec5a974745a9e1ee2b370e00b3)で管理しているドキュメントを https://barloon.jp/ で公開するリポジトリです。 [Notion Blog](https://github.com/ijjk/notion-blog)をフォークしています。[デプロイ](https://github.com/ijjk/notion-blog#deploy-your-own)、[Page Tableの作り方](https://github.com/ijjk/notion-blog#creating-your-pages-table)、[記事の作り方](https://github.com/ijjk/notion-blog#creating-your-pages-table)はNotion Blogを参考にしてください。

## 環境変数

.envファイルに入れるなどしてください。

- NOTION_TOKEN: Notion APIを叩くのに必要。
- BLOG_INDEX_ID: `/article/[slug]` の取得に必要。
- PAGE_INDEX_ID: `/[slug]` の取得に必要。

### NOTION_TOKEN

Notionにログインしたのち、開発者ツールから `token_v2` という名前のクッキーを確認してください。

### \*_INDEX_ID

Notionの任意のページに付与されているIDを使用します。例えば、 https://www.notion.so/Blog-S5qv1QbUzM1wxm3H3SZRQkupi7XjXTul というページをNotion Blogで使うのであれば、 `S5qv1QbUzM1wxm3H3SZRQkupi7XjXTul` がIDになります。

## ローカルでの動かし方

環境変数を設定したのち、 `yarn && yarn dev` してください。

## クレジット (Notion Blog)

- Guillermo Rauch [@rauchg](https://twitter.com/rauchg) for the initial idea
- Shu Ding [@shuding\_](https://twitter.com/shuding_) for the design help
- Luis Alvarez [@luis_fades](https://twitter.com/luis_fades) for design help and bug catching
