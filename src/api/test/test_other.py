#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OneBot Info Image API 其他接口测试脚本
测试 config 和 health 接口，结果输出到控制台
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any

# API 配置
API_BASE_URL = "http://localhost:8805/onebot-info-image"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "OneBot-Info-Image-API-Test/1.0"
}

def print_json_pretty(data: Dict[Any, Any], title: str = "") -> None:
    """美化打印JSON数据"""
    if title:
        print(f"\n📋 {title}")
        print("-" * 50)
    
    try:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"JSON格式化失败: {e}")
        print(data)

def test_health_interface():
    """测试健康检查接口"""
    print("\n🔄 开始测试健康检查接口...")
    print(f"请求地址: {API_BASE_URL}/health")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/health",
            headers=HEADERS,
            timeout=10
        )
        
        print(f"HTTP状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_json_pretty(result, "健康检查响应数据")
            
            # 检查响应格式
            if "status" in result and "timestamp" in result:
                if result["status"] == "ok":
                    print("✅ 健康检查接口测试成功 - 服务正常运行")
                else:
                    print(f"⚠️ 健康检查接口返回异常状态: {result['status']}")
            else:
                print("⚠️ 健康检查接口响应格式不符合预期")
        else:
            print(f"❌ 健康检查接口请求失败: HTTP {response.status_code}")
            print(f"响应内容: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 健康检查接口请求异常: {e}")

def test_config_interface():
    """测试配置信息接口"""
    print("\n🔄 开始测试配置信息接口...")
    print(f"请求地址: {API_BASE_URL}/config")
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/config",
            headers=HEADERS,
            timeout=10
        )
        
        print(f"HTTP状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_json_pretty(result, "配置信息响应数据")
            
            # 检查响应格式和内容
            expected_fields = ["imageStyles", "imageTypes"]
            missing_fields = []
            
            for field in expected_fields:
                if field not in result:
                    missing_fields.append(field)
            
            if not missing_fields:
                print("✅ 配置信息接口测试成功")
                
                # 详细分析配置内容
                print("\n📊 配置信息分析:")
                if "imageStyles" in result:
                    print(f"  支持的图片样式数量: {len(result['imageStyles'])}")
                    for i, style in enumerate(result['imageStyles'], 1):
                        print(f"    {i}. {style}")
                
                if "imageTypes" in result:
                    print(f"  支持的图片类型数量: {len(result['imageTypes'])}")
                    for i, img_type in enumerate(result['imageTypes'], 1):
                        print(f"    {i}. {img_type}")
                        
            else:
                print(f"⚠️ 配置信息接口响应缺少字段: {missing_fields}")
        else:
            print(f"❌ 配置信息接口请求失败: HTTP {response.status_code}")
            print(f"响应内容: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 配置信息接口请求异常: {e}")

def test_api_connectivity():
    """测试API连通性"""
    print("\n🔄 测试API连通性...")
    
    try:
        # 简单的连通性测试
        response = requests.get(
            f"{API_BASE_URL}/health",
            timeout=5
        )
        
        if response.status_code in [200, 404, 500]:
            print("✅ API服务可访问")
            return True
        else:
            print(f"⚠️ API服务响应异常: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到API服务，请检查:")
        print("  1. API服务是否已启动")
        print("  2. 端口8805是否正确")
        print("  3. 防火墙设置")
        return False
    except requests.exceptions.Timeout:
        print("❌ API服务连接超时")
        return False
    except Exception as e:
        print(f"❌ API连通性测试异常: {e}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("OneBot Info Image API 其他接口测试")
    print("=" * 60)
    print(f"API地址: {API_BASE_URL}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 测试API连通性
    if not test_api_connectivity():
        print("\n❌ API服务不可访问，终止测试")
        return
    
    # 测试健康检查接口
    test_health_interface()
    
    # 测试配置信息接口
    test_config_interface()
    
    print("\n" + "=" * 60)
    print("测试完成！")
    print("\n📊 测试总结:")
    print("✅ 已测试接口:")
    print("  - GET /api/health (健康检查)")
    print("  - GET /api/config (配置信息)")
    print("\n💡 提示:")
    print("  如果测试失败，请确保OneBot Info Image API服务正在运行")
    print("  默认服务地址: http://localhost:8805")
    print("=" * 60)

if __name__ == "__main__":
    main()