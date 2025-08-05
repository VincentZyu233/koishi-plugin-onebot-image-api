import { Context } from 'koishi';
import Fastify, { FastifyInstance } from 'fastify';
import { renderUserInfo } from '../renderUserInfo';
import { renderAdminList } from '../renderAdminList';
import { 
  UnifiedUserInfo, 
  UnifiedAdminInfo, 
  UnifiedContextInfo, 
  ImageStyle, 
  ImageType,
  IMAGE_STYLES,
  IMAGE_TYPES
} from '../type';
import { DocsExporter } from './export/exportDocs';
import { resolve } from 'path';
import * as packageJson from '../../package.json';

export interface RestfulServerConfig {
  restfulServiceHost: string;
  restfulServicePort: number;
  restfulServiceRootRouter: string;
}

export class RestfulServer {
  private fastify: FastifyInstance;
  private ctx: Context;
  private config: RestfulServerConfig;

  constructor(ctx: Context, config: RestfulServerConfig) {
    this.ctx = ctx;
    this.config = config;
    this.fastify = Fastify({ 
      logger: false // 使用 Koishi 的日志系统
    });
  }

  private async setupSwagger() {
    // 注册 Swagger 插件
    await this.fastify.register(require('@fastify/swagger'), {
      swagger: {
        info: {
          title: 'OneBot Info Image API',
          description: 'OneBot 用户信息和管理员列表图片渲染 API',
          version: packageJson.version
        },
        host: `${this.config.restfulServiceHost}:${this.config.restfulServicePort}`,
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'health', description: '健康检查相关接口' },
          { name: 'config', description: '配置信息相关接口' },
          { name: 'render', description: '图片渲染相关接口' }
        ]
      }
    });

    // 注册 Swagger UI 插件
    await this.fastify.register(require('@fastify/swagger-ui'), {
      routePrefix: `${this.config.restfulServiceRootRouter}/docs`,
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      },
      uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
      transformSpecificationClone: true
    });
  }

  private setupRoutes() {
    // 健康检查接口
    this.fastify.get(`${this.config.restfulServiceRootRouter}/health`, {
      schema: {
        tags: ['health'],
        summary: '健康检查',
        description: '检查API服务是否正常运行',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              timestamp: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }, async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // 用户信息渲染接口
    this.fastify.post(`${this.config.restfulServiceRootRouter}/render-user-info`, {
      schema: {
        tags: ['render'],
        summary: '渲染用户信息图片',
        description: '根据用户信息和上下文信息渲染用户信息图片',
        querystring: {
          type: 'object',
          properties: {
            'only-image': { 
              type: 'string', 
              enum: ['true', 'false'],
              description: '是否直接返回图片数据而不是JSON响应，默认为false'
            }
          }
        },
        body: {
          type: 'object',
          required: ['userInfo', 'contextInfo'],
          properties: {
            userInfo: {
              type: 'object',
              description: '用户信息',
              properties: {
                userId: { type: 'string', description: '用户ID' },
                nickname: { type: 'string', description: '用户昵称' },
                avatar: { type: 'string', description: '用户头像URL' },
                level: { type: 'number', description: '用户等级' },
                exp: { type: 'number', description: '用户经验值' },
                lastSpeakTime: { type: 'string', format: 'date-time', description: '最后发言时间' },
                joinTime: { type: 'string', format: 'date-time', description: '加入时间' },
                speakCount: { type: 'number', description: '发言次数' },
                cardName: { type: 'string', description: '群名片' },
                // 新增字段 - 基于 napcat 格式
                group_level: { type: 'string', description: '群等级' },
                title: { type: 'string', description: '专属头衔' },
                last_sent_time: { type: 'number', description: '最后发言时间戳' },
                qq_level: { type: 'number', description: 'QQ等级' },
                qqLevel: { type: 'number', description: 'QQ等级(备用字段)' },
                qid: { type: 'string', description: 'QID' },
                eMail: { type: 'string', description: '邮箱' },
                phoneNum: { type: 'string', description: '电话号码' },
                address: { type: 'string', description: '详细地址' },
                country: { type: 'string', description: '国家' },
                province: { type: 'string', description: '省份' },
                city: { type: 'string', description: '城市' },
                shengXiao: { type: 'number', description: '生肖(数字编码)' },
                constellation: { type: 'number', description: '星座(数字编码)' },
                birthday_year: { type: 'number', description: '出生年份' },
                birthday_month: { type: 'number', description: '出生月份' },
                birthday_day: { type: 'number', description: '出生日期' },
                is_vip: { type: 'boolean', description: '是否为VIP' },
                is_years_vip: { type: 'boolean', description: '是否为年费VIP' },
                vip_level: { type: 'number', description: 'VIP等级' },
                status: { type: 'number', description: '用户状态' },
                sex: { type: 'string', description: '性别' },
                age: { type: 'number', description: '年龄' },
                reg_time: { type: 'number', description: '注册时间戳' },
                long_nick: { type: 'string', description: '个性签名' }
              }
            },
            contextInfo: {
              type: 'object',
              description: '上下文信息',
              properties: {
                groupId: { type: 'string', description: '群组ID' },
                groupName: { type: 'string', description: '群组名称' },
                groupAvatar: { type: 'string', description: '群组头像URL' },
                onebotImpl: { type: 'string', description: 'OneBot实现名称' }
              }
            },
            imageStyle: { type: 'string', enum: Object.values(IMAGE_STYLES), description: '图片样式' },
            enableDarkMode: { type: 'boolean', description: '是否启用暗色模式' },
            imageType: { type: 'string', enum: Object.values(IMAGE_TYPES), description: '图片类型' },
            screenshotQuality: { type: 'number', minimum: 1, maximum: 100, description: '截图质量' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  imageBase64: { type: 'string', description: 'Base64编码的图片数据' },
                  imageType: { type: 'string', description: '图片类型' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const { userInfo, contextInfo, imageStyle, enableDarkMode, imageType, screenshotQuality } = request.body as {
          userInfo: UnifiedUserInfo;
          contextInfo: UnifiedContextInfo;
          imageStyle?: ImageStyle;
          enableDarkMode?: boolean;
          imageType?: ImageType;
          screenshotQuality?: number;
        };

        // 获取查询参数
        const queryParams = request.query as { 'only-image'?: string };
        const onlyImage = queryParams['only-image'] === 'true';

        // 参数验证
        if (!userInfo || !contextInfo) {
          return reply.status(400).send({
            error: 'Missing required parameters: userInfo and contextInfo are required'
          });
        }

        // 设置默认值
        const finalImageStyle = imageStyle || IMAGE_STYLES.SOURCE_HAN_SERIF_SC;
        const finalEnableDarkMode = enableDarkMode ?? false;
        const finalImageType = imageType || IMAGE_TYPES.PNG;
        const finalScreenshotQuality = screenshotQuality ?? 80;

        // 调用渲染函数
        const imageBase64 = await renderUserInfo(
          this.ctx,
          userInfo,
          contextInfo,
          finalImageStyle,
          finalEnableDarkMode,
          finalImageType,
          finalScreenshotQuality
        );

        // 如果only-image=true，直接返回图片数据
        if (onlyImage) {
          const imageBuffer = Buffer.from(imageBase64, 'base64');
          const mimeType = finalImageType === IMAGE_TYPES.PNG ? 'image/png' : 
                          finalImageType === IMAGE_TYPES.JPEG ? 'image/jpeg' : 
                          'image/webp';
          
          reply.type(mimeType);
          return reply.send(imageBuffer);
        }

        // 默认返回JSON响应
        return {
          success: true,
          data: {
            imageBase64,
            imageType: finalImageType,
            timestamp: new Date().toISOString()
          }
        };

      } catch (error) {
        this.ctx.logger.error(`RESTful API - renderUserInfo error: ${error.message}`);
        return reply.status(500).send({
          error: 'Internal server error',
          message: error.message
        });
      }
    });

    // 管理员列表渲染接口
    this.fastify.post(`${this.config.restfulServiceRootRouter}/render-admin-list`, {
      schema: {
        tags: ['render'],
        summary: '渲染管理员列表图片',
        description: '根据管理员列表和上下文信息渲染管理员列表图片',
        querystring: {
          type: 'object',
          properties: {
            'only-image': { 
              type: 'string', 
              enum: ['true', 'false'],
              description: '是否直接返回图片数据而不是JSON响应，默认为false'
            }
          }
        },
        body: {
          type: 'object',
          required: ['admins', 'contextInfo'],
          properties: {
            admins: {
              type: 'array',
              description: '管理员列表',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'string', description: '管理员用户ID' },
                  nickname: { type: 'string', description: '管理员昵称' },
                  avatar: { type: 'string', description: '管理员头像URL' },
                  role: { type: 'string', description: '管理员角色' },
                  cardName: { type: 'string', description: '群名片' }
                }
              }
            },
            contextInfo: {
              type: 'object',
              description: '上下文信息',
              properties: {
                groupId: { type: 'string', description: '群组ID' },
                groupName: { type: 'string', description: '群组名称' },
                groupAvatar: { type: 'string', description: '群组头像URL' },
                onebotImpl: { type: 'string', description: 'OneBot实现名称' }
              }
            },
            imageStyle: { type: 'string', enum: Object.values(IMAGE_STYLES), description: '图片样式' },
            enableDarkMode: { type: 'boolean', description: '是否启用暗色模式' },
            imageType: { type: 'string', enum: Object.values(IMAGE_TYPES), description: '图片类型' },
            screenshotQuality: { type: 'number', minimum: 1, maximum: 100, description: '截图质量' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  imageBase64: { type: 'string', description: 'Base64编码的图片数据' },
                  imageType: { type: 'string', description: '图片类型' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const { admins, contextInfo, imageStyle, enableDarkMode, imageType, screenshotQuality } = request.body as {
          admins: UnifiedAdminInfo[];
          contextInfo: UnifiedContextInfo;
          imageStyle?: ImageStyle;
          enableDarkMode?: boolean;
          imageType?: ImageType;
          screenshotQuality?: number;
        };

        // 获取查询参数
        const queryParams = request.query as { 'only-image'?: string };
        const onlyImage = queryParams['only-image'] === 'true';

        // 参数验证
        if (!admins || !Array.isArray(admins) || !contextInfo) {
          return reply.status(400).send({
            error: 'Missing required parameters: admins (array) and contextInfo are required'
          });
        }

        if (admins.length === 0) {
          return reply.status(400).send({
            error: 'admins array cannot be empty'
          });
        }

        // 设置默认值
        const finalImageStyle = imageStyle || IMAGE_STYLES.SOURCE_HAN_SERIF_SC;
        const finalEnableDarkMode = enableDarkMode ?? false;
        const finalImageType = imageType || IMAGE_TYPES.PNG;
        const finalScreenshotQuality = screenshotQuality ?? 80;

        // 调用渲染函数
        const imageBase64 = await renderAdminList(
          this.ctx,
          admins,
          contextInfo,
          finalImageStyle,
          finalEnableDarkMode,
          finalImageType,
          finalScreenshotQuality
        );

        // 如果only-image=true，直接返回图片数据
        if (onlyImage) {
          const imageBuffer = Buffer.from(imageBase64, 'base64');
          const mimeType = finalImageType === IMAGE_TYPES.PNG ? 'image/png' : 
                          finalImageType === IMAGE_TYPES.JPEG ? 'image/jpeg' : 
                          'image/webp';
          
          reply.type(mimeType);
          return reply.send(imageBuffer);
        }

        // 默认返回JSON响应
        return {
          success: true,
          data: {
            imageBase64,
            imageType: finalImageType,
            timestamp: new Date().toISOString()
          }
        };

      } catch (error) {
        this.ctx.logger.error(`RESTful API - renderAdminList error: ${error.message}`);
        return reply.status(500).send({
          error: 'Internal server error',
          message: error.message
        });
      }
    });

    // 获取支持的样式和类型
    this.fastify.get(`${this.config.restfulServiceRootRouter}/config`, {
      schema: {
        tags: ['config'],
        summary: '获取配置信息',
        description: '获取支持的图片样式、类型和默认配置',
        response: {
          200: {
            type: 'object',
            properties: {
              imageStyles: {
                type: 'array',
                items: { type: 'string' },
                description: '支持的图片样式列表'
              },
              imageTypes: {
                type: 'array',
                items: { type: 'string' },
                description: '支持的图片类型列表'
              },
              defaultImageStyle: { type: 'string', description: '默认图片样式' },
              defaultImageType: { type: 'string', description: '默认图片类型' },
              defaultScreenshotQuality: { type: 'number', description: '默认截图质量' }
            }
          }
        }
      }
    }, async (request, reply) => {
      return {
        imageStyles: Object.values(IMAGE_STYLES),
        imageTypes: Object.values(IMAGE_TYPES),
      };
    });
  }

  async start(): Promise<void> {
    try {
      // 先设置 Swagger 和路由
      await this.setupSwagger();
      this.setupRoutes();
      
      await this.fastify.listen({
        host: this.config.restfulServiceHost,
        port: this.config.restfulServicePort
      });
      
      this.ctx.logger.info(`RESTful server started on http://${this.config.restfulServiceHost}:${this.config.restfulServicePort}`);
      this.ctx.logger.info(`API endpoints:`);
      this.ctx.logger.info(`  - GET  ${this.config.restfulServiceRootRouter}/health`);
      this.ctx.logger.info(`  - GET  ${this.config.restfulServiceRootRouter}/config`);
      this.ctx.logger.info(`  - POST ${this.config.restfulServiceRootRouter}/render-user-info`);
      this.ctx.logger.info(`  - POST ${this.config.restfulServiceRootRouter}/render-admin-list`);
      this.ctx.logger.info(`Swagger documentation available at: http://${this.config.restfulServiceHost}:${this.config.restfulServicePort}${this.config.restfulServiceRootRouter}/docs`);
      
      // 导出API文档
      await this.exportApiDocs();
    } catch (error) {
      this.ctx.logger.error(`Failed to start RESTful server: ${error.message}`);
      throw error;
    }
  }

  /**
   * 导出API文档到文件
   */
  private async exportApiDocs(): Promise<void> {
    try {
      const exportPath = resolve(__dirname, '../api/export');
      const docsExporter = new DocsExporter(this.fastify, this.ctx, { exportPath });
      await docsExporter.exportAllDocs();
    } catch (error) {
      this.ctx.logger.error(`导出API文档失败: ${error.message}`);
      // 不抛出错误，避免影响服务器启动
    }
  }

  async stop(): Promise<void> {
    try {
      await this.fastify.close();
      this.ctx.logger.info('RESTful server stopped');
    } catch (error) {
      this.ctx.logger.error(`Failed to stop RESTful server: ${error.message}`);
      throw error;
    }
  }
}