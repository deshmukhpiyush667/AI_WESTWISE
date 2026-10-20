"""
Generates high-resolution realistic test images for all 6 supported waste categories
plus 1 uncertain/ambiguous sample for AI WasteWise testing.
"""

import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sample_test_images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def add_noise(image, factor=8):
    arr = np.array(image, dtype=np.int16)
    noise = np.random.normal(0, factor, arr.shape).astype(np.int16)
    noisy_arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(noisy_arr)

def create_plastic_sample():
    # 512x512 plastic water bottle
    img = Image.new("RGB", (512, 512), (245, 248, 250))
    draw = ImageDraw.Draw(img)

    # Soft background shadow
    draw.ellipse([160, 430, 360, 470], fill=(215, 225, 230))

    # Bottle body (semi-transparent blue/cyan tint)
    draw.rounded_rectangle([200, 160, 312, 430], radius=24, fill=(200, 230, 255), outline=(140, 190, 230), width=4)
    # Bottle neck & shoulder
    draw.polygon([(200, 180), (230, 120), (282, 120), (312, 180)], fill=(200, 230, 255), outline=(140, 190, 230))
    # Cap (blue)
    draw.rounded_rectangle([232, 95, 280, 120], radius=4, fill=(22, 100, 220), outline=(10, 60, 160), width=2)
    # Plastic ridges
    for y in [240, 290, 340, 390]:
        draw.line([(206, y), (306, y)], fill=(170, 215, 245), width=3)
    # Plastic label
    draw.rectangle([202, 260, 310, 330], fill=(230, 245, 255), outline=(160, 205, 240), width=2)
    draw.text((225, 290), "WATER", fill=(20, 80, 180))
    # Light glare reflection
    draw.line([(218, 170), (218, 420)], fill=(255, 255, 255), width=6)

    img = add_noise(img, 4)
    path = os.path.join(OUTPUT_DIR, "01_plastic_bottle.jpg")
    img.save(path, "JPEG", quality=95)
    print("Saved:", path)

def create_organic_sample():
    # 512x512 Organic food waste: yellow banana peel & apple
    img = Image.new("RGB", (512, 512), (248, 246, 240))
    draw = ImageDraw.Draw(img)

    # Shadow
    draw.ellipse([140, 380, 380, 440], fill=(220, 215, 200))

    # Banana curve
    draw.arc([140, 160, 360, 400], start=30, end=170, fill=(240, 200, 30), width=50)
    draw.arc([160, 180, 340, 380], start=40, end=160, fill=(210, 165, 20), width=20)
    # Brown spots on banana peel
    for pos in [(200, 320), (260, 360), (310, 330), (180, 280)]:
        draw.ellipse([pos[0], pos[1], pos[0]+8, pos[1]+6], fill=(110, 75, 20))
    # Banana stem tips
    draw.rectangle([140, 240, 160, 255], fill=(70, 50, 15))
    draw.rectangle([345, 230, 365, 245], fill=(60, 45, 15))

    # Apple core / fruit slice
    draw.ellipse([270, 220, 390, 340], fill=(210, 40, 35))
    draw.ellipse([285, 235, 375, 325], fill=(255, 248, 220))
    # Apple seeds
    draw.ellipse([325, 275, 335, 290], fill=(60, 30, 10))
    # Apple stem and leaf
    draw.line([(330, 220), (330, 195)], fill=(80, 50, 20), width=4)
    draw.ellipse([330, 190, 355, 205], fill=(45, 140, 50))

    img = add_noise(img, 5)
    path = os.path.join(OUTPUT_DIR, "02_organic_food_waste.jpg")
    img.save(path, "JPEG", quality=95)
    print("Saved:", path)

def create_paper_sample():
    # 512x512 Kraft Cardboard box
    img = Image.new("RGB", (512, 512), (248, 247, 244))
    draw = ImageDraw.Draw(img)

    # Box shadow
    draw.polygon([(140, 400), (380, 400), (430, 430), (90, 430)], fill=(215, 210, 200))

    # Cardboard 3D isometric front
    draw.polygon([(150, 240), (360, 240), (360, 400), (150, 400)], fill=(205, 160, 110), outline=(170, 125, 80), width=3)
    # Side face
    draw.polygon([(360, 240), (420, 180), (420, 340), (360, 400)], fill=(180, 135, 85), outline=(150, 110, 65), width=3)
    # Top flap face
    draw.polygon([(150, 240), (210, 180), (420, 180), (360, 240)], fill=(225, 180, 130), outline=(180, 135, 85), width=3)
    # Tape seam
    draw.line([(150, 320), (360, 320)], fill=(230, 200, 150), width=12)
    # Recycling symbol text
    draw.text((220, 270), "RECYCLE", fill=(90, 60, 30))
    draw.text((220, 350), "CARDBOARD", fill=(100, 70, 35))

    img = add_noise(img, 6)
    path = os.path.join(OUTPUT_DIR, "03_paper_cardboard.jpg")
    img.save(path, "JPEG", quality=95)
    print("Saved:", path)

def create_metal_sample():
    # 512x512 Aluminum Soda Can
    img = Image.new("RGB", (512, 512), (246, 246, 248))
    draw = ImageDraw.Draw(img)

    # Shadow
    draw.ellipse([180, 410, 340, 445], fill=(210, 215, 220))

    # Metallic cylinder body (Red Cola Can)
    draw.rounded_rectangle([200, 160, 312, 420], radius=16, fill=(215, 30, 35), outline=(170, 20, 25), width=3)
    # Silver top rim
    draw.ellipse([200, 145, 312, 175], fill=(220, 225, 230), outline=(170, 175, 180), width=3)
    # Silver bottom rim
    draw.ellipse([200, 405, 312, 430], fill=(200, 205, 210), outline=(160, 165, 170), width=2)
    # Pull tab on top
    draw.rounded_rectangle([245, 152, 275, 168], radius=4, fill=(180, 185, 190), outline=(140, 145, 150), width=2)
    draw.ellipse([252, 156, 266, 164], fill=(130, 135, 140))
    # Metallic specular highlight
    draw.line([(220, 175), (220, 410)], fill=(255, 120, 120), width=10)
    draw.line([(224, 175), (224, 410)], fill=(255, 255, 255), width=4)
    # Can brand text
    draw.text((230, 280), "SODA", fill=(255, 255, 255))
    draw.text((230, 310), "ALUMINUM", fill=(255, 240, 240))

    img = add_noise(img, 4)
    path = os.path.join(OUTPUT_DIR, "04_metal_soda_can.jpg")
    img.save(path, "JPEG", quality=95)
    print("Saved:", path)

def create_glass_sample():
    # 512x512 Glass bottle
    img = Image.new("RGB", (512, 512), (245, 248, 247))
    draw = ImageDraw.Draw(img)

    # Shadow
    draw.ellipse([180, 420, 330, 455], fill=(210, 220, 215))

    # Bottle body (Emerald Green transparent glass)
    draw.rounded_rectangle([210, 200, 302, 430], radius=20, fill=(25, 135, 95), outline=(15, 95, 65), width=4)
    # Shoulder & long neck
    draw.polygon([(210, 210), (242, 120), (270, 120), (302, 210)], fill=(25, 135, 95), outline=(15, 95, 65), width=3)
    # Lip / mouth
    draw.rounded_rectangle([238, 105, 274, 122], radius=4, fill=(35, 155, 110), outline=(15, 95, 65), width=2)
    # Sharp glass highlights
    draw.line([(222, 215), (222, 415)], fill=(160, 240, 200), width=6)
    draw.line([(225, 215), (225, 415)], fill=(240, 255, 245), width=2)
    draw.line([(290, 215), (290, 415)], fill=(15, 80, 50), width=4)

    img = add_noise(img, 4)
    path = os.path.join(OUTPUT_DIR, "05_glass_bottle.jpg")
    img.save(path, "JPEG", quality=95)
    print("Saved:", path)

def create_ewaste_sample():
    # 512x512 E-Waste: Cylindrical battery + Circuit chip
    img = Image.new("RGB", (512, 512), (245, 245, 247))
    draw = ImageDraw.Draw(img)

    # Shadow
    draw.ellipse([120, 380, 390, 430], fill=(215, 215, 220))

    # Circuit board base (Green PCB)
    draw.rounded_rectangle([130, 220, 380, 380], radius=12, fill=(20, 95, 55), outline=(12, 65, 35), width=3)
    # Gold traces
    draw.line([(150, 240), (220, 240), (250, 270), (250, 350)], fill=(215, 175, 40), width=3)
    draw.line([(360, 250), (300, 250), (280, 280), (280, 360)], fill=(215, 175, 40), width=3)
    # Microchip (Black square IC)
    draw.rounded_rectangle([210, 270, 300, 340], radius=6, fill=(35, 35, 38), outline=(20, 20, 22), width=2)
    draw.text((225, 300), "CPU-IC", fill=(180, 180, 190))
    # Chip pins
    for y in range(278, 335, 8):
        draw.line([(200, y), (210, y)], fill=(200, 205, 215), width=2)
        draw.line([(300, y), (310, y)], fill=(200, 205, 215), width=2)

    # AA Battery on top
    draw.rounded_rectangle([170, 150, 340, 205], radius=8, fill=(215, 130, 20), outline=(160, 90, 10), width=3)
    # Positive terminal nub
    draw.rounded_rectangle([338, 168, 352, 188], radius=3, fill=(190, 195, 200), outline=(130, 135, 140), width=2)
    # Negative ring
    draw.rectangle([170, 150, 210, 205], fill=(35, 35, 40))
    draw.text((225, 170), "LITHIUM 1.5V", fill=(255, 255, 255))
    draw.text((315, 168), "+", fill=(255, 255, 255))

    img = add_noise(img, 4)
    path = os.path.join(OUTPUT_DIR, "06_ewaste_battery_pcb.jpg")
    img.save(path, "JPEG", quality=95)
    print("Saved:", path)

def create_uncertain_sample():
    # 512x512 Abstract / Ambiguous image to test <60% confidence threshold
    arr = np.random.randint(120, 170, (512, 512, 3), dtype=np.uint8)
    img = Image.fromarray(arr)
    img = img.filter(ImageFilter.GaussianBlur(radius=25))
    draw = ImageDraw.Draw(img)
    draw.text((160, 240), "AMBIGUOUS TEXTURE", fill=(100, 110, 120))
    path = os.path.join(OUTPUT_DIR, "07_uncertain_ambiguous.jpg")
    img.save(path, "JPEG", quality=90)
    print("Saved:", path)

if __name__ == "__main__":
    create_plastic_sample()
    create_organic_sample()
    create_paper_sample()
    create_metal_sample()
    create_glass_sample()
    create_ewaste_sample()
    create_uncertain_sample()
    print("All sample test images generated successfully in:", OUTPUT_DIR)
