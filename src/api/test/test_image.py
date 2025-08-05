#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OneBot Info Image API 图片接口测试脚本
测试 userinfo 和 adminlist 接口，生成四张图片并保存对应的JSON请求体
"""

import requests
import json
import base64
import os
from datetime import datetime
from typing import Dict, Any

# API 配置
API_BASE_URL = "http://localhost:8805/onebot-info-image"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "OneBot-Info-Image-API-Test/1.0"
}

# 图片样式配置
IMAGE_STYLES = {
    "SOURCE_HAN_SERIF_SC": "思源宋体SourceHanSerifSC",
    "LXGW_WENKAI": "落霞孤鹜文楷LXGWWenKai"
}

def save_image_from_base64(base64_data: str, filename: str) -> None:
    """从base64数据保存图片到文件"""
    try:
        image_data = base64.b64decode(base64_data)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        image_dir = os.path.join(script_dir, "result", "image")
        
        # 确保目录存在
        os.makedirs(image_dir, exist_ok=True)
        
        file_path = os.path.join(image_dir, filename)
        
        with open(file_path, 'wb') as f:
            f.write(image_data)
        print(f"✅ 图片已保存: result/image/{filename}")
    except Exception as e:
        print(f"❌ 保存图片失败 {filename}: {e}")

def save_json_request(request_data: Dict[Any, Any], filename: str) -> None:
    """保存请求体JSON到文件"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        json_dir = os.path.join(script_dir, "result", "body-json")
        
        # 确保目录存在
        os.makedirs(json_dir, exist_ok=True)
        
        file_path = os.path.join(json_dir, filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(request_data, f, ensure_ascii=False, indent=2)
        print(f"✅ JSON请求体已保存: result/body-json/{filename}")
    except Exception as e:
        print(f"❌ 保存JSON失败 {filename}: {e}")

def create_userinfo_request_data(style: str) -> Dict[Any, Any]:
    """创建用户信息接口的测试数据"""
    return {
        "userInfo": {
            "user_id": "123456789",  # 修正字段名
            "nickname": "测试用户",
            "avatar": "https://q1.qlogo.cn/g?b=qq&nk=123456789&s=640",
            "level": 15,
            "exp": 8500,
            "lastSpeakTime": "2024-01-15T10:30:00Z",
            "joinTime": "2023-06-01T08:00:00Z",
            "speakCount": 1250,
            "card": "群管理员",  # 修正字段名
            "group_level": "18",
            "title": "活跃用户",
            "last_sent_time": 1705312200000,  # 修正为毫秒时间戳
            "join_time": 1685577600000,  # 添加加群时间戳（毫秒）
            "qq_level": 64,
            "q_id": "qid_test_123456789",
            "eMail": "test@example.com",
            "phoneNum": "138****8888",
            "address": "北京市朝阳区某某街道",
            "country": "中国",
            "province": "北京",
            "city": "北京市",
            "shengXiao": 3,
            "constellation": 7,
            "birthday_year": 1995,
            "birthday_month": 8,
            "birthday_day": 15,
            "is_vip": True,
            "is_years_vip": False,
            "vip_level": 6,
            "status": 10,
            "sex": "male",
            "age": 28,
            "reg_time": 1234567890,
            "long_nick": "这是一个测试用户的个性签名，用于展示API功能",
            "role": "admin"  # 添加群角色
        },
        "contextInfo": {
            "isGroup": True,  # 添加群聊标识
            "groupId": 987654321,  # 修正为数字类型
            "groupName": "OneBot API 测试群",
            "groupAvatar": "https://p.qlogo.cn/gh/987654321/987654321/640/",
            "memberCount": 150,  # 添加群成员数量
            "maxMemberCount": 200,  # 添加群成员上限
            "onebotImpl": "NapCat"
        },
        "imageStyle": style,
        "enableDarkMode": False,
        "imageType": "png",
        "screenshotQuality": 90
    }

def create_adminlist_request_data(style: str) -> Dict[Any, Any]:
    """创建管理员列表接口的测试数据"""
    return {
        "admins": [
            {
                "user_id": 111111111,  # 修正字段名和类型
                "nickname": "群主大大",
                "avatar": "https://q1.qlogo.cn/g?b=qq&nk=111111111&s=640",
                "role": "owner",
                "card": "至高无上的群主"  # 修正字段名
            },
            {
                "user_id": 222222222,  # 修正字段名和类型
                "nickname": "管理员小助手",
                "avatar": "https://q1.qlogo.cn/g?b=qq&nk=222222222&s=640",
                "role": "admin",
                "card": "贴心小管家"  # 修正字段名
            },
            {
                "user_id": 333333333,  # 修正字段名和类型
                "nickname": "技术管理",
                "avatar": "https://q1.qlogo.cn/g?b=qq&nk=333333333&s=640",
                "role": "admin",
                "card": "代码搬运工"  # 修正字段名
            },
            {
                "user_id": 444444444,  # 修正字段名和类型
                "nickname": "活动管理",
                "avatar": "https://q1.qlogo.cn/g?b=qq&nk=444444444&s=640",
                "role": "admin",
                "card": "活动策划师"  # 修正字段名
            }
        ],
        "contextInfo": {
            "isGroup": True,  # 添加群聊标识
            "groupId": 987654321,  # 修正为数字类型
            "groupName": "OneBot API 测试群",
            "groupAvatar": "https://p.qlogo.cn/gh/987654321/987654321/640/",
            "memberCount": 150,  # 添加群成员数量
            "maxMemberCount": 200,  # 添加群成员上限
            "onebotImpl": "NapCat"
        },
        "imageStyle": style,
        "enableDarkMode": False,
        "imageType": "png",
        "screenshotQuality": 90
    }

def test_userinfo_interface():
    """测试用户信息接口"""
    print("\n🔄 开始测试用户信息接口...")
    
    for style_key, style_value in IMAGE_STYLES.items():
        print(f"\n📝 测试样式: {style_key} ({style_value})")
        
        # 创建请求数据
        request_data = create_userinfo_request_data(style_value)
        
        # 保存请求体JSON
        json_filename = f"userinfo_request_{style_key.lower()}.json"
        save_json_request(request_data, json_filename)
        
        try:
            # 发送请求
            response = requests.post(
                f"{API_BASE_URL}/render-user-info",
                headers=HEADERS,
                json=request_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    # 保存图片
                    image_filename = f"userinfo_{style_key.lower()}.png"
                    save_image_from_base64(result["data"]["imageBase64"], image_filename)
                    print(f"✅ 用户信息接口测试成功 - {style_key}")
                else:
                    print(f"❌ 用户信息接口返回失败 - {style_key}: {result}")
            else:
                print(f"❌ 用户信息接口请求失败 - {style_key}: HTTP {response.status_code}")
                print(f"响应内容: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 用户信息接口请求异常 - {style_key}: {e}")

def test_adminlist_interface():
    """测试管理员列表接口"""
    print("\n🔄 开始测试管理员列表接口...")
    
    for style_key, style_value in IMAGE_STYLES.items():
        print(f"\n📝 测试样式: {style_key} ({style_value})")
        
        # 创建请求数据
        request_data = create_adminlist_request_data(style_value)
        
        # 保存请求体JSON
        json_filename = f"adminlist_request_{style_key.lower()}.json"
        save_json_request(request_data, json_filename)
        
        try:
            # 发送请求
            response = requests.post(
                f"{API_BASE_URL}/render-admin-list",
                headers=HEADERS,
                json=request_data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    # 保存图片
                    image_filename = f"adminlist_{style_key.lower()}.png"
                    save_image_from_base64(result["data"]["imageBase64"], image_filename)
                    print(f"✅ 管理员列表接口测试成功 - {style_key}")
                else:
                    print(f"❌ 管理员列表接口返回失败 - {style_key}: {result}")
            else:
                print(f"❌ 管理员列表接口请求失败 - {style_key}: HTTP {response.status_code}")
                print(f"响应内容: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ 管理员列表接口请求异常 - {style_key}: {e}")

def main():
    """主函数"""
    print("=" * 60)
    print("OneBot Info Image API 图片接口测试")
    print("=" * 60)
    print(f"API地址: {API_BASE_URL}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 测试用户信息接口
    test_userinfo_interface()
    
    # 测试管理员列表接口
    test_adminlist_interface()
    
    print("\n" + "=" * 60)
    print("测试完成！")
    print("生成的文件:")
    print("📸 图片文件:")
    print("  - userinfo_source_han_serif_sc.png")
    print("  - userinfo_lxgw_wenkai.png")
    print("  - adminlist_source_han_serif_sc.png")
    print("  - adminlist_lxgw_wenkai.png")
    print("📄 JSON请求体文件:")
    print("  - userinfo_request_source_han_serif_sc.json")
    print("  - userinfo_request_lxgw_wenkai.json")
    print("  - adminlist_request_source_han_serif_sc.json")
    print("  - adminlist_request_lxgw_wenkai.json")
    print("=" * 60)

if __name__ == "__main__":
    main()