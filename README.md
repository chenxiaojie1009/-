# 🔐 密码管理器 (Password Vault)

内网设备账号密码管理工具 — 集中管理服务器、交换机、路由器等设备的账号密码，支持多级权限、审计日志、自动备份。

## ✨ 功能

- 🖥️ **设备管理** — 服务器 / 交换机 / 路由器 / 防火墙 / 存储设备 / 纵加设备
- 🌐 **多 IP / MAC** — 每个设备支持多个 IP 地址和 MAC 地址（可带标签）
- 🔑 **密码加密** — 设备密码 Fernet 对称加密存储，可解密查看
- 👥 **三级权限** — 管理员（全部）/ 编辑者（增删改）/ 查看者（只读）
- 🔒 **首次登录改密** — 新用户首次登录强制修改默认密码
- 📜 **密码历史** — 记录每次密码变更的时间、操作人、原因
- 📊 **Excel 导出** — 一键导出全部设备数据（含密码）
- 📥 **批量导入** — 上传 Excel 批量导入设备信息，含模板下载
- 📝 **审计日志** — 登录/增删改/导出/导入 全部记录可追溯
- 💾 **自动备份** — 每天凌晨 2 点自动备份，保留最近 30 个备份
- 🛡️ **密码强度** — 5 维度评分（长度/大小写/数字/特殊字符）

## 🚀 快速开始（部署）

无需安装 Python，下载即用：

```powershell
# 1. 下载 deploy 文件夹到目标 Windows 机器
# 2. 双击 启动.vbs（静默启动，无黑框）
# 3. 浏览器自动打开 http://127.0.0.1:8000
```

> 默认管理员：`admin` / `admin123`（首次登录需修改密码）

## 🛠 技术栈

| 层 | 技术 |
|---|------|
| 后端 | Python FastAPI + SQLAlchemy + SQLite |
| 前端 | React 19 + TypeScript + Ant Design 5 |
| 认证 | JWT + bcrypt（用户密码）/ Fernet（设备密码） |
| 打包 | PyInstaller → 独立 EXE（30MB） |
| 测试 | pytest（46 个测试用例，全部通过） |

## 📁 项目结构

```
Password-Vault/
├── backend/
│   ├── main.py              # FastAPI 全功能后端
│   ├── models.py             # 7 张数据库表
│   ├── schemas.py            # Pydantic 模型
│   ├── auth.py               # JWT + bcrypt + Fernet
│   ├── database.py           # SQLite 配置
│   ├── requirements.txt      # Python 依赖
│   └── tests/                # 46 个测试用例
├── frontend/
│   ├── src/
│   │   ├── pages/            # 6 个页面
│   │   │   ├── Login.tsx           # 登录 + 首次改密
│   │   │   ├── DeviceList.tsx      # 设备列表
│   │   │   ├── DeviceForm.tsx      # 添加/编辑设备
│   │   │   ├── PasswordHistory.tsx # 密码历史
│   │   │   ├── AuditLog.tsx        # 审计日志
│   │   │   └── UserManagement.tsx  # 用户管理
│   │   ├── components/       # AppLayout, DeviceModal
│   │   └── api/              # Axios 封装
│   └── dist/                 # 构建产物
└── deploy/                   # 一键部署包
    ├── DeviceManager.exe     # 独立可执行文件
    ├── 启动.vbs               # 静默启动脚本
    └── README.txt
```

## 🔧 开发

```bash
# 后端
cd backend
pip install -r requirements.txt
python main.py              # → http://localhost:8000

# 前端
cd frontend
npm install
npm run dev                 # → http://localhost:3000（开发代理到后端）

# 测试
cd backend
python -m pytest tests/ -v  # 46 passed
```

## 📦 打包

```bash
cd backend
pyinstaller --noconfirm --onefile --noconsole \
  --add-data "frontend-dist;frontend/dist" \
  --hidden-import passlib.handlers.bcrypt \
  --hidden-import openpyxl \
  main.py
# → dist/DeviceManager.exe
```

## 🔑 API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录（返回 JWT） |
| POST | `/api/auth/change-password` | 当前用户修改密码 |
| GET | `/api/devices` | 设备列表（支持搜索/筛选） |
| POST | `/api/devices` | 创建设备 |
| PUT | `/api/devices/{id}` | 更新设备 |
| DELETE | `/api/devices/{id}` | 删除设备 |
| POST | `/api/export` | 导出 Excel |
| POST | `/api/import/xlsx` | 批量导入 |
| GET | `/api/password-history` | 密码修改历史 |
| GET | `/api/audit-logs` | 审计日志 |
| GET | `/api/backups` | 备份管理 |
| GET | `/api/users` | 用户管理（管理员） |
| PUT | `/api/users/{id}/reset-password` | 重置用户密码 |

## 📄 License

MIT
