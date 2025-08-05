#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OneBot Info Image API 测试脚本
测试四个端点：health、config、render-user-info、render-admin-list
"""

import json
import base64
import os
from datetime import datetime

import requests


# API 配置
BASE_URL = "http://localhost:8805"
ROOT_ROUTER = "/onebot-info-image"
API_BASE = f"{BASE_URL}{ROOT_ROUTER}"

# 测试数据
SAMPLE_USER_INFO = {
    "user_id": "123456789",
    "nickname": "测试用户",
    "sex": "male",
    "age": 25,
    "card": "群昵称",
    "level": "10",
    "qq_level": 15,
    "join_time": 1640995200000,
    "last_sent_time": 1704067200000,
    "role": "member",
    "title": "活跃用户",
    "avatar": "https://q1.qlogo.cn/g?b=qq&nk=123456789&s=640",
    "sign": "这是我的个性签名",
    "area": "北京",
    "is_vip": True,
    "vip_level": 7,
    "login_days": 365
}

SAMPLE_CONTEXT_INFO = {
    "isGroup": True,
    "groupId": 987654321,
    "groupName": "测试群聊",
    "memberCount": 150,
    "maxMemberCount": 200,
    "groupAvatarUrl": "https://p.qlogo.cn/gh/987654321/987654321/640/"
}

SAMPLE_ADMIN_LIST = [
    {
        "user_id": 111111111,
        "nickname": "群主大大",
        "card": "群主",
        "sex": "female",
        "age": 28,
        "role": "owner",
        "title": "群主",
        "avatar": "https://q1.qlogo.cn/g?b=qq&nk=111111111&s=640",
        "qq_level": 20,
        "join_time": 1609459200000,
        "last_sent_time": 1704067200000
    },
    {
        "user_id": 222222222,
        "nickname": "管理员A",
        "card": "管理A",
        "sex": "male",
        "age": 24,
        "role": "admin",
        "title": "管理员",
        "avatar": "https://q1.qlogo.cn/g?b=qq&nk=222222222&s=640",
        "qq_level": 18,
        "join_time": 1625097600000,
        "last_sent_time": 1704067200000
    },
    {
        "user_id": 333333333,
        "nickname": "管理员B",
        "card": "管理B",
        "sex": "unknown",
        "age": 26,
        "role": "admin",
        "title": "管理员",
        "avatar": "https://q1.qlogo.cn/g?b=qq&nk=333333333&s=640",
        "qq_level": 16,
        "join_time": 1640995200000,
        "last_sent_time": 1704067200000
    }
]

def save_image_from_base64(base64_data, filename):
    """从base64数据保存图片到文件"""
    try:
        # 移除base64前缀（如果存在）
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        # 解码base64数据
        image_data = base64.b64decode(base64_data)
        
        # 保存到文件
        with open(filename, 'wb') as f:
            f.write(image_data)
        
        print(f"✅ 图片已保存到: {filename}")
        return True
    except Exception as e:
        print(f"❌ 保存图片失败: {e}")
        return False

def test_health_endpoint():
    """测试健康检查端点"""
    print("\n🔍 测试健康检查端点...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 健康检查成功")
            print(f"响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 健康检查失败: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_config_endpoint():
    """测试配置信息端点"""
    print("\n🔍 测试配置信息端点...")
    try:
        response = requests.get(f"{API_BASE}/config", timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 获取配置成功")
            print(f"响应数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 获取配置失败: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_render_user_info():
    """测试用户信息渲染端点"""
    print("\n🔍 测试用户信息渲染端点...")
    try:
        payload = {
            "userInfo": SAMPLE_USER_INFO,
            "contextInfo": SAMPLE_CONTEXT_INFO,
            "imageStyle": "落霞孤鹜文楷LXGWWenKai",
            "enableDarkMode": False,
            "imageType": "png",
            "screenshotQuality": 80
        }
        
        response = requests.post(
            f"{API_BASE}/render-user-info",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 用户信息渲染成功")
            
            if data.get('success') and 'data' in data:
                image_base64 = data['data']['imageBase64']
                image_type = data['data']['imageType']
                timestamp = data['data']['timestamp']
                
                print(f"图片类型: {image_type}")
                print(f"生成时间: {timestamp}")
                print(f"Base64长度: {len(image_base64)}")
                
                # 保存图片
                filename = f"user_info_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{image_type}"
                save_image_from_base64(image_base64, filename)
            else:
                print(f"❌ 响应格式异常: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 用户信息渲染失败: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_render_admin_list():
    """测试管理员列表渲染端点"""
    print("\n🔍 测试管理员列表渲染端点...")
    try:
        payload = {
            "admins": SAMPLE_ADMIN_LIST,
            "contextInfo": SAMPLE_CONTEXT_INFO,
            "imageStyle": "思源宋体SourceHanSerifSC",
            "enableDarkMode": True,
            "imageType": "png",
            "screenshotQuality": 90
        }
        
        response = requests.post(
            f"{API_BASE}/render-admin-list",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 管理员列表渲染成功")
            
            if data.get('success') and 'data' in data:
                image_base64 = data['data']['imageBase64']
                image_type = data['data']['imageType']
                timestamp = data['data']['timestamp']
                
                print(f"图片类型: {image_type}")
                print(f"生成时间: {timestamp}")
                print(f"Base64长度: {len(image_base64)}")
                
                # 保存图片
                filename = f"admin_list_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{image_type}"
                save_image_from_base64(image_base64, filename)
            else:
                print(f"❌ 响应格式异常: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ 管理员列表渲染失败: {response.text}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def main():
    """主函数"""
    print("🚀 OneBot Info Image API 测试开始")
    print(f"API 基础地址: {API_BASE}")
    print("=" * 60)
    
    # 测试所有端点
    test_health_endpoint()
    test_config_endpoint()
    test_render_user_info()
    test_render_admin_list()
    
    print("\n" + "=" * 60)
    print("🎉 测试完成！")
    
    # 显示当前目录下的图片文件
    current_dir = os.getcwd()
    image_files = [f for f in os.listdir(current_dir) if f.endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    if image_files:
        print(f"\n📁 当前目录下的图片文件:")
        for img_file in image_files:
            file_size = os.path.getsize(img_file)
            print(f"  - {img_file} ({file_size} bytes)")
    else:
        print(f"\n📁 当前目录下没有找到图片文件")

if __name__ == "__main__":
    main()