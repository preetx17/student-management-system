import os
from PIL import Image, ImageDraw, ImageFont

img_dir = os.path.join(os.getcwd(), "diagrams")
os.makedirs(img_dir, exist_ok=True)

# Minimalist Elegant Theme
BG_COLOR = (11, 15, 25)             
CARD_BG = (23, 32, 51)             
BORDER_CYAN = (0, 242, 254)         
BORDER_INDIGO = (99, 102, 241)      
BORDER_EMERALD = (16, 185, 129)     
BORDER_AMBER = (251, 191, 36)       
BORDER_ROSE = (244, 63, 94)         

TEXT_WHITE = (255, 255, 255)
TEXT_CYAN = (56, 189, 248)          
TEXT_MUTED = (148, 163, 184)        
TEXT_DARK = (15, 23, 42)

def get_font(size, bold=False):
    font_paths = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf" if bold else "C:\\Windows\\Fonts\\calibri.ttf"
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except:
                pass
    return ImageFont.load_default()

font_title = get_font(100, bold=True)
font_subtitle = get_font(55, bold=False)
font_card_h = get_font(60, bold=True)
font_body = get_font(45, bold=False)
font_body_bold = get_font(45, bold=True)
font_badge = get_font(35, bold=True)

def draw_card(draw, box, fill=CARD_BG, outline=BORDER_CYAN, radius=30, width=5):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def draw_badge(draw, box, text, bg_color, text_color=TEXT_WHITE):
    draw.rounded_rectangle(box, radius=12, fill=bg_color)
    x = (box[0] + box[2]) // 2
    y = (box[1] + box[3]) // 2
    draw.text((x, y), text, fill=text_color, font=font_badge, anchor="mm")

# ==============================================================================
# 1. ER DIAGRAM
# ==============================================================================
def generate_er_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 40), "ER DIAGRAM", fill=TEXT_WHITE, font=font_title, anchor="mt")
    draw.text((1200, 160), "Core Database Entities", fill=BORDER_CYAN, font=font_subtitle, anchor="mt")

    # Table 1: TEACHERS
    t_box = (100, 250, 780, 1320)
    draw_card(draw, t_box, CARD_BG, BORDER_CYAN)
    draw.rounded_rectangle((100, 250, 780, 360), radius=30, fill=(14, 116, 144))
    draw.text((440, 305), "TEACHERS", fill=TEXT_WHITE, font=font_card_h, anchor="mm")
    
    t_fields = [
        ("id", "INT", "PK", BORDER_AMBER),
        ("username", "VARCHAR", "UK", BORDER_CYAN),
        ("password", "VARCHAR", "HASH", BORDER_INDIGO),
        ("role", "ENUM", "ROLE", BORDER_ROSE),
        ("name", "VARCHAR", "FLD", (71, 85, 105)),
        ("department", "VARCHAR", "FLD", (71, 85, 105)),
        ("course1", "VARCHAR", "REL", BORDER_EMERALD),
        ("course2", "VARCHAR", "REL", BORDER_EMERALD),
    ]
    
    y = 400
    for name, dtype, badge_txt, badge_bg in t_fields:
        draw.rounded_rectangle((120, y, 760, y + 90), radius=16, fill=(30, 41, 59))
        draw_badge(draw, (140, y + 15, 240, y + 75), badge_txt, badge_bg, TEXT_WHITE if badge_bg != BORDER_AMBER and badge_bg != BORDER_CYAN else TEXT_DARK)
        draw.text((260, y + 45), name, fill=TEXT_WHITE, font=font_body_bold, anchor="lm")
        draw.text((740, y + 45), dtype, fill=TEXT_MUTED, font=font_body, anchor="rm")
        y += 110

    # Table 2: STUDENTS
    s_box = (850, 250, 1530, 1020)
    draw_card(draw, s_box, CARD_BG, BORDER_EMERALD)
    draw.rounded_rectangle((850, 250, 1530, 360), radius=30, fill=(4, 120, 87))
    draw.text((1190, 305), "STUDENTS", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    s_fields = [
        ("id", "INT", "PK", BORDER_AMBER),
        ("name", "VARCHAR", "FLD", (71, 85, 105)),
        ("age", "INT", "CHK", BORDER_ROSE),
        ("course", "VARCHAR", "REL", BORDER_EMERALD),
        ("email", "VARCHAR", "UK", BORDER_CYAN),
    ]
    
    y = 400
    for name, dtype, badge_txt, badge_bg in s_fields:
        draw.rounded_rectangle((870, y, 1510, y + 90), radius=16, fill=(30, 41, 59))
        draw_badge(draw, (890, y + 15, 990, y + 75), badge_txt, badge_bg, TEXT_WHITE if badge_bg != BORDER_AMBER and badge_bg != BORDER_CYAN else TEXT_DARK)
        draw.text((1010, y + 45), name, fill=TEXT_WHITE, font=font_body_bold, anchor="lm")
        draw.text((1490, y + 45), dtype, fill=TEXT_MUTED, font=font_body, anchor="rm")
        y += 110

    # Table 3: SETTINGS
    set_box = (1600, 250, 2280, 650)
    draw_card(draw, set_box, CARD_BG, BORDER_AMBER)
    draw.rounded_rectangle((1600, 250, 2280, 360), radius=30, fill=(180, 83, 9))
    draw.text((1940, 305), "SETTINGS", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    set_fields = [
        ("key_name", "VARCHAR", "PK", BORDER_AMBER),
        ("key_value", "VARCHAR", "FLD", (71, 85, 105)),
    ]
    y = 400
    for name, dtype, badge_txt, badge_bg in set_fields:
        draw.rounded_rectangle((1620, y, 2260, y + 90), radius=16, fill=(30, 41, 59))
        draw_badge(draw, (1640, y + 15, 1740, y + 75), badge_txt, badge_bg, TEXT_DARK if badge_bg == BORDER_AMBER else TEXT_WHITE)
        draw.text((1760, y + 45), name, fill=TEXT_WHITE, font=font_body_bold, anchor="lm")
        draw.text((2240, y + 45), dtype, fill=TEXT_MUTED, font=font_body, anchor="rm")
        y += 110

    # Connectors
    draw.line([(780, 600), (850, 600)], fill=BORDER_CYAN, width=12)
    draw.polygon([(820, 570), (850, 600), (820, 630)], fill=BORDER_CYAN)

    im.save(os.path.join(img_dir, "er_diagram.png"), quality=100)

# ==============================================================================
# 2. DFD LEVEL 0
# ==============================================================================
def generate_dfd_l0_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 40), "DFD LEVEL 0", fill=TEXT_WHITE, font=font_title, anchor="mt")
    draw.text((1200, 160), "Context Diagram", fill=BORDER_CYAN, font=font_subtitle, anchor="mt")

    # Center Process Bubble
    center_box = (800, 400, 1600, 950)
    draw.ellipse(center_box, fill=CARD_BG, outline=BORDER_CYAN, width=12)
    draw.text((1200, 620), "SMS SYSTEM", fill=TEXT_WHITE, font=font_title, anchor="mm")
    draw.text((1200, 720), "API Gateway", fill=BORDER_EMERALD, font=font_subtitle, anchor="mm")

    # Left Entities
    draw_card(draw, (100, 350, 550, 600), CARD_BG, BORDER_CYAN)
    draw.text((325, 475), "TEACHER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    draw_card(draw, (100, 750, 550, 1000), CARD_BG, BORDER_AMBER)
    draw.text((325, 875), "OWNER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    # Right Entity
    draw_card(draw, (1850, 550, 2300, 800), CARD_BG, BORDER_EMERALD)
    draw.text((2075, 675), "CLOUD DB", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    # Lines
    draw.line([(550, 475), (820, 550)], fill=BORDER_CYAN, width=10)
    draw.line([(550, 875), (820, 800)], fill=BORDER_AMBER, width=10)
    draw.line([(1600, 675), (1850, 675)], fill=BORDER_EMERALD, width=10)

    im.save(os.path.join(img_dir, "dfd_level0_diagram.png"), quality=100)

# ==============================================================================
# 3. DFD LEVEL 1
# ==============================================================================
def generate_dfd_l1_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 40), "DFD LEVEL 1", fill=TEXT_WHITE, font=font_title, anchor="mt")
    draw.text((1200, 160), "Decomposed Modules", fill=BORDER_CYAN, font=font_subtitle, anchor="mt")

    processes = [
        (150, 300, 750, 550, "1.0 AUTHENTICATION", BORDER_CYAN),
        (850, 300, 1550, 550, "2.0 STUDENT CRUD", BORDER_EMERALD),
        (1650, 300, 2250, 550, "3.0 BATCH PROCESSING", BORDER_AMBER),
        (550, 650, 1150, 900, "4.0 SETTINGS", BORDER_ROSE),
    ]

    for x1, y1, x2, y2, title, color in processes:
        draw_card(draw, (x1, y1, x2, y2), CARD_BG, color)
        draw.text(((x1+x2)//2, (y1+y2)//2), title, fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    draw_card(draw, (200, 1050, 2200, 1250), CARD_BG, BORDER_INDIGO)
    draw.text((1200, 1150), "CLOUD DATABASE STORES", fill=BORDER_INDIGO, font=font_card_h, anchor="mm")

    im.save(os.path.join(img_dir, "dfd_level1_diagram.png"), quality=100)

# ==============================================================================
# 4. USE CASE DIAGRAM
# ==============================================================================
def generate_usecase_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 40), "USE CASE DIAGRAM", fill=TEXT_WHITE, font=font_title, anchor="mt")

    # Actors
    draw_card(draw, (200, 300, 650, 550), CARD_BG, BORDER_CYAN)
    draw.text((425, 425), "TEACHER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    draw_card(draw, (200, 800, 650, 1050), CARD_BG, BORDER_AMBER)
    draw.text((425, 925), "OWNER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    # Use Cases
    cases = [
        (900, 200, 1500, 400, "Manage Students", BORDER_CYAN),
        (900, 450, 1500, 650, "CSV Batch Upload", BORDER_CYAN),
        (900, 700, 1500, 900, "Manage Profile", BORDER_CYAN),
        (1600, 750, 2200, 950, "Rotate Invite Key", BORDER_AMBER),
        (1600, 1000, 2200, 1200, "Supervise System", BORDER_AMBER),
    ]

    for x1, y1, x2, y2, title, outline in cases:
        draw.rounded_rectangle((x1, y1, x2, y2), radius=50, fill=CARD_BG, outline=outline, width=8)
        draw.text(((x1+x2)//2, (y1+y2)//2), title, fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    im.save(os.path.join(img_dir, "usecase_diagram.png"), quality=100)

# ==============================================================================
# 5. PROCESS FLOW
# ==============================================================================
def generate_process_flow_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 40), "PROCESS PIPELINES", fill=TEXT_WHITE, font=font_title, anchor="mt")

    # Pipeline A
    draw_card(draw, (150, 200, 1150, 1200), CARD_BG, BORDER_EMERALD)
    draw.text((650, 280), "STUDENT CREATION", fill=BORDER_EMERALD, font=font_card_h, anchor="mm")
    
    steps_a = ["1. Form Submit", "2. Session Guard", "3. Validation (Age)", "4. Upload Avatar", "5. SQL Insert"]
    y = 400
    for s in steps_a:
        draw.rounded_rectangle((250, y, 1050, y+110), radius=20, fill=(4, 120, 87))
        draw.text((650, y+55), s, fill=TEXT_WHITE, font=font_body_bold, anchor="mm")
        y += 150

    # Pipeline B
    draw_card(draw, (1250, 200, 2250, 1200), CARD_BG, BORDER_CYAN)
    draw.text((1750, 280), "AUTHENTICATION", fill=BORDER_CYAN, font=font_card_h, anchor="mm")

    steps_b = ["1. Submit Login", "2. Rate Limiter", "3. DB Lookup", "4. Bcrypt Hash", "5. Session Cookie"]
    y = 400
    for s in steps_b:
        draw.rounded_rectangle((1350, y, 2150, y+110), radius=20, fill=(14, 116, 144))
        draw.text((1750, y+55), s, fill=TEXT_WHITE, font=font_body_bold, anchor="mm")
        y += 150

    im.save(os.path.join(img_dir, "process_flow_diagram.png"), quality=100)

if __name__ == "__main__":
    generate_er_diagram()
    generate_dfd_l0_diagram()
    generate_dfd_l1_diagram()
    generate_usecase_diagram()
    generate_process_flow_diagram()
