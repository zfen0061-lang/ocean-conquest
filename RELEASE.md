# 发布《海岛战争 · 潮汐航线》

## GitHub 源码和简历试玩链接

1. 用 [GitHub Desktop](https://desktop.github.com/) 登录个人 GitHub 账号，在 **File → Add local repository** 选择项目根目录。
2. 点 **Publish repository**，建议仓库名为 ocean-conquest。确认可以公开源码后，取消勾选 **Keep this code private** 再发布。也可以在 [GitHub 新建仓库](https://github.com/new) 后，通过 Git 推送到自己的仓库。[GitHub Desktop 官方指引](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-an-existing-project-to-github-using-github-desktop)
3. 打开仓库的 **Settings → Pages**，将 Source 设为 **Deploy from a branch**，选择 **main** 和 **/docs**，然后点 Save。部署完成后从同一页面复制试玩链接。常见地址格式为 `https://<GitHub用户名>.github.io/ocean-conquest/`。[GitHub Pages 官方指引](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
4. 今后修改代码后运行 `npm.cmd test`，将 `src/` 和生成的 `docs/index.html` 一起提交。仓库保留 `docs/index.html`，Pages 可以直接发布。

## 抖音小游戏真机预览

1. 在 [抖音开放平台](https://developer.open-douyin.com/) 的控制台中创建**普通小游戏**，在开发设置中取得 AppID。[创建与信息完善](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/tags/categories)
2. 安装 [抖音开发者工具](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/dev-tools/developer-instrument-update-and-download)，使用该小游戏的开发者账号登录。
3. 在本项目运行 `npm.cmd run build`。在开发者工具选择导入**小游戏**，项目目录选择 `build/douyin`，填入自己的 AppID。这个目录里的 `game.js`、`game.json` 和 `project.config.json` 是平台导入入口。[抖音小游戏开发指南](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/guide/dev-guide/bytedance-mini-game)
4. 编译通过后点击**预览**，用手机抖音扫码。先检查进局、滑动多岛出兵、关卡推进、侧边栏入口和返回后存档。电脑上的接口模拟测试覆盖了核心路径，实际触摸、渲染和侧边栏需要真机验证。[真机预览与上传](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/develop)
5. 真机确认后，在开发者工具点**上传**，填写版本号与更新说明。可以先选测试通道。准备公开时再到版本管理提审，并在控制台按主体与类目完善软著、自审及适用的备案或版号信息。[版本上传](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/dev-tools/mini-app-developer-instrument) · [备案申报](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/game-filing-application-works)

把 AppID 留在本地的 `build/douyin/project.config.json`。重新构建会保留文件中已填写的 AppID，Git 会忽略 `build/`。正式发布前，在开发者工具里重新核对平台当时要求的必接能力和审核材料。
