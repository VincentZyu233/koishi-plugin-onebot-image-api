# OneBot Info Image API - RESTful API 使用说明

本插件现在提供了 RESTful API 接口，可以通过 HTTP 请求调用用户信息和管理员列表的渲染功能。

## 配置

在插件配置中，您可以设置以下 RESTful 服务相关参数：

- `restfulServiceHost`: 服务主机地址（默认: `0.0.0.0`）
- `restfulServicePort`: 服务端口号（默认: `8805`）
- `restfulServiceRootRouter`: 服务根路由（默认: `/onebot-info-image`）

## API 文档

本 API 提供了完整的 Swagger 文档，您可以通过以下地址访问：

**Swagger 文档地址:** `http://{host}:{port}{rootRouter}/docs`

例如，使用默认配置时的文档地址为：
`http://localhost:8805/onebot-info-image/docs`

Swagger 文档提供了：
- 完整的 API 接口说明
- 交互式的 API 测试界面
- 详细的请求/响应参数说明
- 实时的 API 调用示例

## API 端点

### 1. 健康检查

**GET** `{rootRouter}/health`

返回服务器状态信息。

**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. 获取配置信息

**GET** `{rootRouter}/config`

返回支持的图片样式和类型。

**响应示例:**
```json
{
  "imageStyles": ["思源宋体SourceHanSerifSC", "落霞孤鹜文楷LXGWWenKai"],
  "imageTypes": ["png", "jpeg", "webp"],
  "defaultImageStyle": "落霞孤鹜文楷LXGWWenKai",
  "defaultImageType": "png",
  "defaultScreenshotQuality": 80
}
```

### 3. 渲染用户信息

**POST** `{rootRouter}/render-user-info`

渲染用户信息为图片并返回 Base64 编码。

**请求体:**
```json
{
  "userInfo": {
    "user_id": "123456789",
    "nickname": "用户昵称",
    "sex": "male",
    "age": 25,
    "card": "群昵称",
    "role": "member",
    "join_time": 1640995200000,
    "avatar": "https://example.com/avatar.jpg"
  },
  "contextInfo": {
    "isGroup": true,
    "groupId": 987654321,
    "groupName": "测试群",
    "memberCount": 100,
    "maxMemberCount": 200
  },
  "imageStyle": "落霞孤鹜文楷LXGWWenKai",
  "enableDarkMode": false,
  "imageType": "png",
  "screenshotQuality": 80
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "imageType": "png",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. 渲染管理员列表

**POST** `{rootRouter}/render-admin-list`

渲染群管理员列表为图片并返回 Base64 编码。

**请求体:**
```json
{
  "admins": [
    {
      "user_id": 123456789,
      "nickname": "群主昵称",
      "card": "群主群昵称",
      "role": "owner",
      "join_time": 1640995200,
      "avatar": "https://example.com/avatar1.jpg"
    },
    {
      "user_id": 987654321,
      "nickname": "管理员昵称",
      "card": "管理员群昵称",
      "role": "admin",
      "join_time": 1641081600,
      "avatar": "https://example.com/avatar2.jpg"
    }
  ],
  "contextInfo": {
    "isGroup": true,
    "groupId": 987654321,
    "groupName": "测试群",
    "memberCount": 100,
    "maxMemberCount": 200
  },
  "imageStyle": "落霞孤鹜文楷LXGWWenKai",
  "enableDarkMode": false,
  "imageType": "png",
  "screenshotQuality": 80
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "imageType": "png",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## 参数说明

### userInfo (UnifiedUserInfo)
- `user_id`: 用户QQ号（必需）
- `nickname`: 用户昵称（必需）
- `sex`: 性别 (`"male"` | `"female"` | `"unknown"`)
- `age`: 年龄
- `card`: 群昵称
- `role`: 群角色 (`"owner"` | `"admin"` | `"member"`)
- `join_time`: 入群时间（时间戳，毫秒）
- `avatar`: 头像URL
- 其他字段请参考 `type.ts` 中的 `UnifiedUserInfo` 接口

### admins (UnifiedAdminInfo[])
- `user_id`: 用户QQ号（必需）
- `nickname`: 用户昵称（必需）
- `card`: 群昵称
- `role`: 管理员角色 (`"owner"` | `"admin"`)（必需）
- `join_time`: 入群时间（时间戳，秒）
- `avatar`: 头像URL
- 其他字段请参考 `type.ts` 中的 `UnifiedAdminInfo` 接口

### contextInfo (UnifiedContextInfo)
- `isGroup`: 是否为群聊（必需）
- `groupId`: 群号
- `groupName`: 群名称
- `memberCount`: 群成员数
- `maxMemberCount`: 群最大成员数

### 可选参数
- `imageStyle`: 图片样式（默认: `"落霞孤鹜文楷LXGWWenKai"`）
- `enableDarkMode`: 是否启用暗黑模式（默认: `false`）
- `imageType`: 图片类型（默认: `"png"`）
- `screenshotQuality`: 截图质量，仅对 JPEG 和 WebP 有效（默认: `80`）

## 错误处理

API 会返回适当的 HTTP 状态码和错误信息：

- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误

**错误响应示例:**
```json
{
  "error": "Missing required parameters: userInfo and contextInfo are required",
  "message": "详细错误信息"
}
```

## 使用示例

### curl 示例

```bash
# 健康检查
curl -X GET http://localhost:8805/onebot-info-image/health

# 渲染用户信息
curl -X POST http://localhost:8805/onebot-info-image/render-user-info \
  -H "Content-Type: application/json" \
  -d '{
    "userInfo": {
      "user_id": "123456789",
      "nickname": "测试用户",
      "sex": "male",
      "age": 25
    },
    "contextInfo": {
      "isGroup": false
    }
  }'
```

### JavaScript 示例

```javascript
const response = await fetch('http://localhost:8805/onebot-info-image/render-user-info', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userInfo: {
      user_id: '123456789',
      nickname: '测试用户',
      sex: 'male',
      age: 25
    },
    contextInfo: {
      isGroup: false
    }
  })
});

const result = await response.json();
if (result.success) {
  const imageBase64 = result.data.imageBase64;
  // 使用 Base64 图片数据
}
```

## 注意事项

1. 服务器启动后会在控制台输出可用的 API 端点信息和 Swagger 文档地址
2. 确保 Puppeteer 和 HTTP 服务正常运行
3. 图片渲染可能需要一些时间，请设置适当的超时时间
4. Base64 编码的图片数据可能较大，请注意网络传输限制
5. 推荐使用 Swagger 文档进行 API 测试和调试，它提供了更直观的界面和完整的参数说明

## 快速开始

1. 启动 Koishi 服务器
2. 访问 Swagger 文档页面：`http://localhost:8805/onebot-info-image/docs`
3. 在 Swagger 界面中测试各个 API 接口
4. 根据需要调整参数并集成到您的应用中