import os
from PIL import Image, ImageDraw

def convert_white_to_transparent(input_path):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        # 简单阈值法：将所有接近白色的像素转为透明
        # 泛洪填充比较复杂且易出错（如果边界不闭合），对于简单素材，全局替换通常是第一选择
        # 但为了防止误伤内部白色，我们先尝试做一个“智能”一点的全局替换
        # 只要 R, G, B 都大于 240，就认为是背景白
        
        newData = []
        for item in datas:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        
        # 构建输出路径 (.jpg -> .png)
        output_path = os.path.splitext(input_path)[0] + ".png"
        img.save(output_path, "PNG")
        print(f"Converted: {input_path} -> {output_path}")
        return True
    except Exception as e:
        print(f"Error converting {input_path}: {e}")
        return False

files_to_convert = [
    "public/cat.jpg",
    "public/正确.jpg",
    "public/中间错误.jpg",
    "public/左边错误.jpg",
    "public/右边错误.jpg",
    "public/logo.jpg",
    "public/douyin.jpg",
    "public/group.jpg",
    "public/splash.jpg"
]

print("Starting conversion...")
for file_path in files_to_convert:
    if os.path.exists(file_path):
        convert_white_to_transparent(file_path)
    else:
        print(f"File not found: {file_path}")
print("Done.")
