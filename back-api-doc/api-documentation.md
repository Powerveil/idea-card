# Chat API 接口文档

## 概述

本文档描述了基于DeepSeek模型的聊天API接口，包括同步和流式两种调用方式。

## 基础信息

- **基础URL**: `http://localhost:8080/chat`
- **模型**: DeepSeek Chat
- **API版本**: v1

## 接口列表

### 1. 同步聊天接口

#### 接口描述
发送消息并获取完整的响应内容。

#### 请求信息
- **URL**: `/sync`
- **方法**: `POST`
- **内容类型**: `application/json`

#### 请求体 (JSON)
| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| message | String | 是 | 用户发送的消息内容 |
| systemPrompt | String | 否 | 系统提示词，用于设置AI助手的角色和行为 |

#### 请求示例
```bash
# 基本请求
curl -X POST "http://localhost:8080/chat/sync" \
     -H "Content-Type: application/json" \
     -d '{"message": "你好，请介绍一下自己"}'

# 带系统提示词的请求
curl -X POST "http://localhost:8080/chat/sync" \
     -H "Content-Type: application/json" \
     -d '{
           "message": "解释一下量子计算",
           "systemPrompt": "你是一位专业的物理学家，请用通俗易懂的语言解释复杂的物理概念"
         }'
```

#### 响应信息
- **内容类型**: `text/plain`
- **响应**: 模型生成的完整回复文本

#### 响应示例
```
你好！我是DeepSeek开发的AI助手，很高兴为您服务...
```

---

### 2. 流式聊天接口

#### 接口描述
发送消息并以流式方式获取响应，适合需要实时显示生成过程的场景。

#### 请求信息
- **URL**: `/stream`
- **方法**: `POST`
- **内容类型**: `application/json`
- **响应类型**: `text/event-stream`

#### 请求体 (JSON)
| 字段名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| message | String | 否 | "分析一下金价为什么会稳定上涨" | 用户发送的消息内容 |
| systemPrompt | String | 否 | 无 | 系统提示词，用于设置AI助手的角色和行为 |

#### 请求示例
```bash
# 基本请求
curl -X POST "http://localhost:8080/chat/stream" \
     -H "Content-Type: application/json" \
     -d '{"message": "请解释一下量子计算的基本原理"}'

# 带系统提示词的请求
curl -X POST "http://localhost:8080/chat/stream" \
     -H "Content-Type: application/json" \
     -d '{
           "message": "分析一下最近的股市趋势",
           "systemPrompt": "你是一位经验丰富的金融分析师，请提供专业的市场分析"
         }'
```

#### 响应信息
- **内容类型**: `text/event-stream`
- **响应**: 实时流式文本数据

#### 响应示例
```
量子计算
是一种
基于量子力学
原理的计算方式...
```

## 错误处理

当请求发生错误时，系统会返回相应的错误信息：

### 常见错误码
| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求体JSON格式是否正确 |
| 500 | 服务器内部错误 | 检查服务器日志或联系管理员 |
| 503 | 服务不可用 | 检查DeepSeek API服务状态 |

## 使用建议

1. **同步接口**适用于需要完整响应结果的场景，如报告生成、数据分析等。
2. **流式接口**适用于需要实时反馈的场景，如聊天机器人、实时翻译等。
3. 建议在客户端实现适当的超时处理，特别是对于流式接口。
4. 流式接口客户端需要支持读取HTTP Chunked响应。

## 配置说明

当前系统配置：
- **模型**: DeepSeek Chat / DeepSeek Reasoner (Stream)
- **API地址**: https://api.deepseek.com
- **超时设置**: 60秒
- **最大HTTP头大小**: 1MB (解决长Token请求问题)

## 实现细节

### 提示词工程
本系统采用LangChain4j推荐的提示词工程方式：
- 使用`@SystemMessage`注解定义系统提示词模板
- 使用`@UserMessage`注解定义用户消息模板
- 使用`@V`注解进行变量绑定
- 通过`AiServices`创建服务实例，实现提示词与模型的绑定

### 技术架构
- **同步聊天**: 使用ChatService接口，基于@SystemMessage和@UserMessage注解
- **流式聊天**: 使用StreamingChatService接口，返回TokenStream
- **依赖管理**: 通过Spring Boot自动装配，管理LangChain4j组件生命周期
- **请求处理**: 重构为POST请求，支持JSON Body，解决URL长度限制问题

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.3 | 2025-12-07 | 接口重构为POST方法，支持JSON请求体；解决请求头过大问题；增加请求日志记录 |
| v1.2 | 2025-12-06 | 采用LangChain4j推荐的@SystemMessage+@UserMessage+@V注解方式实现提示词工程 |
| v1.1 | 2025-12-06 | 添加系统提示词支持，允许用户自定义AI助手角色和行为 |
| v1.0 | 2025-12-06 | 初始版本，支持同步和流式聊天接口 |
