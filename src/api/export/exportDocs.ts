import { FastifyInstance } from 'fastify';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { Context } from 'koishi';
import * as yaml from 'js-yaml';

// 扩展 FastifyInstance 类型以包含 swagger 方法
declare module 'fastify' {
  interface FastifyInstance {
    swagger(): any;
  }
}

export interface ExportDocsConfig {
  exportPath: string;
}

export class DocsExporter {
  private fastify: FastifyInstance;
  private ctx: Context;
  private config: ExportDocsConfig;

  constructor(fastify: FastifyInstance, ctx: Context, config: ExportDocsConfig) {
    this.fastify = fastify;
    this.ctx = ctx;
    this.config = config;
  }

  /**
   * 导出所有格式的API文档
   */
  async exportAllDocs(): Promise<void> {
    try {
      // 确保导出目录存在
      mkdirSync(this.config.exportPath, { recursive: true });

      // 获取 Swagger 规范
      const swaggerSpec = this.fastify.swagger();
      
      // 导出 OpenAPI 3.1 格式
      await this.exportOpenAPI31(swaggerSpec);
      
      // 导出 Swagger 2.0 格式
      await this.exportSwagger20(swaggerSpec);

      this.ctx.logger.info(`API 文档已导出到: ${this.config.exportPath}`);
      this.ctx.logger.info('导出的文件:');
      this.ctx.logger.info('  - openapi3.1.json');
      this.ctx.logger.info('  - openapi3.1.yaml');
      this.ctx.logger.info('  - swagger2.0.json');
      this.ctx.logger.info('  - swagger2.0.yaml');

    } catch (error) {
      this.ctx.logger.error(`导出API文档失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 导出 OpenAPI 3.1 格式文档
   */
  private async exportOpenAPI31(swaggerSpec: any): Promise<void> {
    // 转换为 OpenAPI 3.1 格式
    const openapi31Spec = this.convertToOpenAPI31(swaggerSpec);

    // 导出 JSON 格式
    const jsonPath = resolve(this.config.exportPath, 'openapi3.1.json');
    writeFileSync(jsonPath, JSON.stringify(openapi31Spec, null, 2), 'utf-8');

    // 导出 YAML 格式
    const yamlPath = resolve(this.config.exportPath, 'openapi3.1.yaml');
    const yamlContent = yaml.dump(openapi31Spec, { 
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    writeFileSync(yamlPath, yamlContent, 'utf-8');
  }

  /**
   * 导出 Swagger 2.0 格式文档
   */
  private async exportSwagger20(swaggerSpec: any): Promise<void> {
    // Swagger 规范本身就是 2.0 格式，但需要修改host
    const swagger20Spec = { 
      ...swaggerSpec,
      host: 'sh_aliyun.vincentzyu233.cn:57805'
    };

    // 导出 JSON 格式
    const jsonPath = resolve(this.config.exportPath, 'swagger2.0.json');
    writeFileSync(jsonPath, JSON.stringify(swagger20Spec, null, 2), 'utf-8');

    // 导出 YAML 格式
    const yamlPath = resolve(this.config.exportPath, 'swagger2.0.yaml');
    const yamlContent = yaml.dump(swagger20Spec, { 
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
    writeFileSync(yamlPath, yamlContent, 'utf-8');
  }

  /**
   * 将 Swagger 2.0 规范转换为 OpenAPI 3.1 格式
   */
  private convertToOpenAPI31(swaggerSpec: any): any {
    const openapi31Spec = {
      openapi: '3.1.0',
      info: {
        ...swaggerSpec.info,
        version: swaggerSpec.info.version || '1.0.0'
      },
      servers: [
        {
          url: 'http://sh_aliyun.vincentzyu233.cn:57805',
          description: 'OneBot Info Image API Server'
        }
      ],
      paths: {},
      components: {
        schemas: {},
        responses: {},
        parameters: {},
        examples: {},
        requestBodies: {},
        headers: {},
        securitySchemes: {},
        links: {},
        callbacks: {}
      },
      tags: swaggerSpec.tags || []
    };

    // 转换路径
    if (swaggerSpec.paths) {
      for (const [path, pathItem] of Object.entries(swaggerSpec.paths)) {
        openapi31Spec.paths[path] = this.convertPathItem(pathItem as any);
      }
    }

    // 转换定义为组件
    if (swaggerSpec.definitions) {
      for (const [name, definition] of Object.entries(swaggerSpec.definitions)) {
        openapi31Spec.components.schemas[name] = this.convertSchema(definition as any);
      }
    }

    return openapi31Spec;
  }

  /**
   * 转换路径项
   */
  private convertPathItem(pathItem: any): any {
    const convertedPathItem: any = {};

    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'].includes(method)) {
        convertedPathItem[method] = this.convertOperation(operation as any);
      }
    }

    return convertedPathItem;
  }

  /**
   * 转换操作
   */
  private convertOperation(operation: any): any {
    const convertedOperation: any = {
      ...operation,
      responses: {}
    };

    // 转换响应
    if (operation.responses) {
      for (const [statusCode, response] of Object.entries(operation.responses)) {
        convertedOperation.responses[statusCode] = this.convertResponse(response as any);
      }
    }

    // 转换请求体
    if (operation.parameters) {
      const bodyParam = operation.parameters.find((p: any) => p.in === 'body');
      if (bodyParam) {
        convertedOperation.requestBody = {
          description: bodyParam.description || '',
          required: bodyParam.required || false,
          content: {
            'application/json': {
              schema: this.convertSchema(bodyParam.schema)
            }
          }
        };
        // 移除 body 参数
        convertedOperation.parameters = operation.parameters.filter((p: any) => p.in !== 'body');
      }
    }

    return convertedOperation;
  }

  /**
   * 转换响应
   */
  private convertResponse(response: any): any {
    const convertedResponse: any = {
      description: response.description || ''
    };

    if (response.schema) {
      convertedResponse.content = {
        'application/json': {
          schema: this.convertSchema(response.schema)
        }
      };
    }

    return convertedResponse;
  }

  /**
   * 转换模式
   */
  private convertSchema(schema: any): any {
    if (!schema) return {};

    const convertedSchema = { ...schema };

    // 递归转换嵌套的模式
    if (schema.properties) {
      convertedSchema.properties = {};
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        convertedSchema.properties[propName] = this.convertSchema(propSchema as any);
      }
    }

    if (schema.items) {
      convertedSchema.items = this.convertSchema(schema.items);
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      convertedSchema.additionalProperties = this.convertSchema(schema.additionalProperties);
    }

    return convertedSchema;
  }
}