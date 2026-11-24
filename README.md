# 海岛战争 · 潮汐航线

Ocean Conquest: Tidal Routes is an original, offline 2D island strategy game built with JavaScript and Canvas. Swipe across friendly islands to send fleets together, seize neutral ports to grow your forces, and capture every rival's islands to win.

战役共 200 场，每 50 场组成一个海域。前 40 场保留原地图与存档编号，后续由多组海图布局生成。后段的对手会更频繁出兵，部分关卡会出现三方争夺、协同夹击及岸防据点。

## 本地试玩

直接打开 [docs/index.html](docs/index.html)。浏览器版可离线运行。

在项目目录使用 **Node.js 20 或以上**构建和测试，无需安装依赖。

    npm.cmd run build
    npm.cmd test

构建产物包括 docs/index.html（浏览器和 GitHub Pages）及 build/douyin/（抖音小游戏开发者工具工程）。

## 项目结构

| 目录 | 内容 |
| --- | --- |
| src/core/ | 关卡、兵力生产与容量、海空行军、碰撞结算、随机布岛和多阵营 AI |
| src/shared/ | 两端共用的海图和海空单位绘制 |
| src/web/ | 浏览器页面、点击和滑动输入、本地进度 |
| src/douyin/ | 抖音 Canvas 接口、触摸输入、设备存档、侧边栏与前后台事件 |
| tests/ | 200 关通关模拟、随机布岛、存档兼容及抖音运行时模拟测试 |

## 发布

[发布指南](RELEASE.md)包含 GitHub 仓库、GitHub Pages 和抖音测试版的操作。抖音工程已经通过本地接口模拟测试，真机预览和平台审核仍需在抖音开发者工具中完成。

## 简历参考

**海岛战争 · 潮汐航线｜JavaScript、Canvas、Node.js**  
开发 2D 海岛策略游戏，实现 200 场战役、随机海图、多岛滑动派兵、海空拦截和多阵营 AI。将战斗规则与渲染层分离，复用于浏览器和抖音小游戏，并通过 Node.js 自动化验证通关、岛屿生产及触摸交互。

**Ocean Conquest: Tidal Routes | JavaScript, Canvas, Node.js**  
Built a 2D strategy game with 200 battles, randomized island layouts, multi-island touch controls, and rival AI. Reused the battle engine across browser and Douyin Mini Game builds and automated campaign and input tests.

在简历里使用 GitHub 源码地址和实际可玩的 Pages 地址。线上或抖音链接在发布成功后再填写。
