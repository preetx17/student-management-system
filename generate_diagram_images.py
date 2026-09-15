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

font_title = get_font(52, bold=True)
font_subtitle = get_font(32, bold=False)
font_card_h = get_font(30, bold=True)
font_body = get_font(24, bold=False)
font_body_bold = get_font(24, bold=True)
font_badge = get_font(20, bold=True)

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

    draw.text((1200, 60), "ER DIAGRAM", fill=TEXT_WHITE, font=font_title, anchor="mt")
    draw.text((1200, 130), "Core Database Entities", fill=BORDER_CYAN, font=font_subtitle, anchor="mt")

    # Table 1: TEACHERS
    t_box = (150, 250, 750, 1150)
    draw_card(draw, t_box, CARD_BG, BORDER_CYAN)
    draw.rounded_rectangle((150, 250, 750, 360), radius=30, fill=(14, 116, 144))
    draw.text((450, 305), "TEACHERS", fill=TEXT_WHITE, font=font_card_h, anchor="mm")
    
    t_fields = [
        ("id", "INT", "PK", BORDER_AMBER),
        ("username", "VARCHAR", "UK", BORDER_CYAN),
        ("password", "VARCHAR", "HASH", BORDER_INDIGO),
        ("role", "ENUM", "ROLE", BORDER_ROSE),
        ("name", "VARCHAR", "FLD", (71, 85, 105)),
        ("department", "VARCHAR", "FLD", (71, 85, 105)),
    ]
    
    y = 420
    for name, dtype, badge_txt, badge_bg in t_fields:
        draw.rounded_rectangle((200, y, 700, y + 80), radius=16, fill=(30, 41, 59))
        draw_badge(draw, (220, y + 15, 300, y + 65), badge_txt, badge_bg, TEXT_WHITE if badge_bg != BORDER_AMBER and badge_bg != BORDER_CYAN else TEXT_DARK)
        draw.text((330, y + 25), name, fill=TEXT_WHITE, font=font_body_bold)
        draw.text((670, y + 25), dtype, fill=TEXT_MUTED, font=font_body, anchor="ra")
        y += 110

    # Table 2: STUDENTS
    s_box = (900, 250, 1500, 950)
    draw_card(draw, s_box, CARD_BG, BORDER_EMERALD)
    draw.rounded_rectangle((900, 250, 1500, 360), radius=30, fill=(4, 120, 87))
    draw.text((1200, 305), "STUDENTS", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    s_fields = [
        ("id", "INT", "PK", BORDER_AMBER),
        ("name", "VARCHAR", "FLD", (71, 85, 105)),
        ("age", "INT", "CHK", BORDER_ROSE),
        ("email", "VARCHAR", "UK", BORDER_CYAN),
    ]
    
    y = 420
    for name, dtype, badge_txt, badge_bg in s_fields:
        draw.rounded_rectangle((950, y, 1450, y + 80), radius=16, fill=(30, 41, 59))
        draw_badge(draw, (970, y + 15, 1050, y + 65), badge_txt, badge_bg, TEXT_WHITE if badge_bg != BORDER_AMBER and badge_bg != BORDER_CYAN else TEXT_DARK)
        draw.text((1080, y + 25), name, fill=TEXT_WHITE, font=font_body_bold)
        draw.text((1420, y + 25), dtype, fill=TEXT_MUTED, font=font_body, anchor="ra")
        y += 110

    # Table 3: SETTINGS
    set_box = (1650, 250, 2250, 650)
    draw_card(draw, set_box, CARD_BG, BORDER_AMBER)
    draw.rounded_rectangle((1650, 250, 2250, 360), radius=30, fill=(180, 83, 9))
    draw.text((1950, 305), "SETTINGS", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    set_fields = [
        ("key_name", "VARCHAR", "PK", BORDER_AMBER),
        ("key_value", "VARCHAR", "FLD", (71, 85, 105)),
    ]
    y = 420
    for name, dtype, badge_txt, badge_bg in set_fields:
        draw.rounded_rectangle((1700, y, 2200, y + 80), radius=16, fill=(30, 41, 59))
        draw_badge(draw, (1720, y + 15, 1800, y + 65), badge_txt, badge_bg, TEXT_DARK if badge_bg == BORDER_AMBER else TEXT_WHITE)
        draw.text((1830, y + 25), name, fill=TEXT_WHITE, font=font_body_bold)
        draw.text((2170, y + 25), dtype, fill=TEXT_MUTED, font=font_body, anchor="ra")
        y += 110

    # Connectors
    draw.line([(750, 600), (900, 600)], fill=BORDER_CYAN, width=8)
    draw.polygon([(870, 580), (900, 600), (870, 620)], fill=BORDER_CYAN)
    draw.rounded_rectangle((780, 560, 870, 640), radius=12, fill=(14, 116, 144))
    draw.text((825, 600), "1:N", fill=TEXT_WHITE, font=font_body_bold, anchor="mm")

    im.save(os.path.join(img_dir, "er_diagram.png"), quality=100)

# ==============================================================================
# 2. DFD LEVEL 0
# ==============================================================================
def generate_dfd_l0_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 60), "DFD LEVEL 0", fill=TEXT_WHITE, font=font_title, anchor="mt")
    draw.text((1200, 130), "Context Diagram", fill=BORDER_CYAN, font=font_subtitle, anchor="mt")

    # Center Process Bubble
    center_box = (800, 450, 1600, 900)
    draw.ellipse(center_box, fill=CARD_BG, outline=BORDER_CYAN, width=8)
    draw.text((1200, 620), "SMS SYSTEM", fill=TEXT_WHITE, font=font_title, anchor="mm")
    draw.text((1200, 700), "API Gateway", fill=BORDER_EMERALD, font=font_subtitle, anchor="mm")

    # Left Entities
    draw_card(draw, (150, 400, 550, 600), CARD_BG, BORDER_CYAN)
    draw.text((350, 500), "TEACHER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    draw_card(draw, (150, 750, 550, 950), CARD_BG, BORDER_AMBER)
    draw.text((350, 850), "OWNER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    # Right Entity
    draw_card(draw, (1850, 575, 2250, 775), CARD_BG, BORDER_EMERALD)
    draw.text((2050, 675), "CLOUD DB", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    # Lines
    draw.line([(550, 500), (830, 560)], fill=BORDER_CYAN, width=6)
    draw.line([(550, 850), (830, 790)], fill=BORDER_AMBER, width=6)
    draw.line([(1570, 675), (1850, 675)], fill=BORDER_EMERALD, width=6)

    im.save(os.path.join(img_dir, "dfd_level0_diagram.png"), quality=100)

# ==============================================================================
# 3. DFD LEVEL 1
# ==============================================================================
def generate_dfd_l1_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 60), "DFD LEVEL 1", fill=TEXT_WHITE, font=font_title, anchor="mt")
    draw.text((1200, 130), "Decomposed Modules", fill=BORDER_CYAN, font=font_subtitle, anchor="mt")

    processes = [
        (200, 300, 700, 500, "1.0 AUTHENTICATION", BORDER_CYAN),
        (900, 300, 1500, 500, "2.0 STUDENT CRUD", BORDER_EMERALD),
        (1700, 300, 2200, 500, "3.0 BATCH PROCESSING", BORDER_AMBER),
        (550, 700, 1150, 900, "4.0 SETTINGS", BORDER_ROSE),
    ]

    for x1, y1, x2, y2, title, color in processes:
        draw_card(draw, (x1, y1, x2, y2), CARD_BG, color)
        draw.text(((x1+x2)//2, (y1+y2)//2), title, fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    draw_card(draw, (200, 1050, 2200, 1200), CARD_BG, BORDER_INDIGO)
    draw.text((1200, 1125), "CLOUD DATABASE STORES", fill=BORDER_INDIGO, font=font_card_h, anchor="mm")

    im.save(os.path.join(img_dir, "dfd_level1_diagram.png"), quality=100)

# ==============================================================================
# 4. USE CASE DIAGRAM
# ==============================================================================
def generate_usecase_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 60), "USE CASE DIAGRAM", fill=TEXT_WHITE, font=font_title, anchor="mt")

    # Actors
    draw_card(draw, (200, 350, 600, 550), CARD_BG, BORDER_CYAN)
    draw.text((400, 450), "TEACHER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    draw_card(draw, (200, 800, 600, 1000), CARD_BG, BORDER_AMBER)
    draw.text((400, 900), "OWNER", fill=TEXT_WHITE, font=font_card_h, anchor="mm")

    # Use Cases
    cases = [
        (900, 250, 1400, 400, "Manage Students", BORDER_CYAN),
        (900, 450, 1400, 600, "CSV Batch Upload", BORDER_CYAN),
        (900, 650, 1400, 800, "Manage Profile", BORDER_CYAN),
        (1600, 750, 2100, 900, "Rotate Invite Key", BORDER_AMBER),
        (1600, 950, 2100, 1100, "Supervise System", BORDER_AMBER),
    ]

    for x1, y1, x2, y2, title, outline in cases:
        draw.rounded_rectangle((x1, y1, x2, y2), radius=50, fill=CARD_BG, outline=outline, width=5)
        draw.text(((x1+x2)//2, (y1+y2)//2), title, fill=TEXT_WHITE, font=font_body_bold, anchor="mm")

    im.save(os.path.join(img_dir, "usecase_diagram.png"), quality=100)

# ==============================================================================
# 5. PROCESS FLOW
# ==============================================================================
def generate_process_flow_diagram():
    im = Image.new("RGB", (2400, 1350), BG_COLOR)
    draw = ImageDraw.Draw(im)

    draw.text((1200, 60), "PROCESS PIPELINES", fill=TEXT_WHITE, font=font_title, anchor="mt")

    # Pipeline A
    draw_card(draw, (200, 200, 1100, 1150), CARD_BG, BORDER_EMERALD)
    draw.text((650, 270), "STUDENT CREATION", fill=BORDER_EMERALD, font=font_card_h, anchor="mm")
    
    steps_a = ["1. Form Submit", "2. Session Guard", "3. Validation (Age)", "4. Upload Avatar", "5. SQL Insert"]
    y = 380
    for s in steps_a:
        draw.rounded_rectangle((300, y, 1000, y+100), radius=20, fill=(4, 120, 87))
        draw.text((650, y+50), s, fill=TEXT_WHITE, font=font_body_bold, anchor="mm")
        y += 140

    # Pipeline B
    draw_card(draw, (1300, 200, 2200, 1150), CARD_BG, BORDER_CYAN)
    draw.text((1750, 270), "AUTHENTICATION", fill=BORDER_CYAN, font=font_card_h, anchor="mm")

    steps_b = ["1. Submit Login", "2. Rate Limiter", "3. DB Lookup", "4. Bcrypt Hash Match", "5. Session Cookie"]
    y = 380
    for s in steps_b:
        draw.rounded_rectangle((1400, y, 2100, y+100), radius=20, fill=(14, 116, 144))
        draw.text((1750, y+50), s, fill=TEXT_WHITE, font=font_body_bold, anchor="mm")
        y += 140

    im.save(os.path.join(img_dir, "process_flow_diagram.png"), quality=100)

if __name__ == "__main__":
    generate_er_diagram()
    generate_dfd_l0_diagram()
    generate_dfd_l1_diagram()
    generate_usecase_diagram()
    generate_process_flow_diagram()
