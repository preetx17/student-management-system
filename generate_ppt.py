import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    img_dir = os.path.join(os.getcwd(), "diagrams")

    # High-Contrast Minimalist Theme
    DARK_BG = RGBColor(7, 10, 18)           
    CARD_BG = RGBColor(17, 24, 39)          
    PRIMARY = RGBColor(99, 102, 241)        
    SECONDARY = RGBColor(16, 185, 129)      
    ACCENT_CYAN = RGBColor(0, 242, 254)     
    ACCENT_ROSE = RGBColor(244, 63, 94)     
    WHITE = RGBColor(255, 255, 255)
    LIGHT_TEXT = RGBColor(226, 232, 240)    
    MUTED = RGBColor(148, 163, 184)         

    def set_bg(slide):
        fill = slide.background.fill
        fill.solid()
        fill.fore_color.rgb = DARK_BG

    def add_hero(slide, title, subtitle, badge_text="FINAL PRESENTATION"):
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.1), Inches(1.5), Inches(3.1), Inches(0.5))
        badge.fill.solid()
        badge.fill.fore_color.rgb = PRIMARY
        badge.line.fill.background()
        p_b = badge.text_frame.paragraphs[0]
        p_b.text = badge_text.upper()
        p_b.font.size = Pt(14)
        p_b.font.bold = True
        p_b.font.color.rgb = WHITE
        p_b.alignment = PP_ALIGN.CENTER

        tbox = slide.shapes.add_textbox(Inches(0.5), Inches(2.5), Inches(12.33), Inches(2.0))
        tf = tbox.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(64)
        p1.font.bold = True
        p1.font.color.rgb = WHITE
        p1.alignment = PP_ALIGN.CENTER

        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(28)
        p2.font.color.rgb = ACCENT_CYAN
        p2.alignment = PP_ALIGN.CENTER
        p2.space_before = Pt(20)

    def add_split(slide, badge_text, title, subtitle, list_title, items, is_right=False):
        # Left Side (or right)
        txt_left = Inches(7.2) if is_right else Inches(0.8)
        
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, txt_left, Inches(1.8), Inches(2.5), Inches(0.4))
        badge.fill.solid()
        badge.fill.fore_color.rgb = DARK_BG
        badge.line.color.rgb = PRIMARY
        badge.line.width = Pt(1.5)
        p_b = badge.text_frame.paragraphs[0]
        p_b.text = badge_text.upper()
        p_b.font.size = Pt(13)
        p_b.font.bold = True
        p_b.font.color.rgb = PRIMARY
        p_b.alignment = PP_ALIGN.CENTER

        t_box = slide.shapes.add_textbox(txt_left, Inches(2.5), Inches(5.3), Inches(2.0))
        tf = t_box.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(44)
        p1.font.bold = True
        p1.font.color.rgb = WHITE

        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(22)
        p2.font.color.rgb = MUTED
        p2.space_before = Pt(10)

        # Card Side
        card_left = Inches(0.8) if is_right else Inches(6.8)
        add_card(slide, card_left, Inches(1.5), Inches(5.7), Inches(4.5), list_title, items, font_size=18)

    def add_card(slide, left, top, width, height, title="", items=[], bg_color=CARD_BG, border_color=ACCENT_CYAN, font_size=18):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1.5)

        tb = slide.shapes.add_textbox(left + Inches(0.4), top + Inches(0.4), width - Inches(0.8), height - Inches(0.8))
        tf = tb.text_frame
        tf.word_wrap = True

        if title:
            p_t = tf.paragraphs[0]
            p_t.text = title
            p_t.font.size = Pt(font_size + 6)
            p_t.font.bold = True
            p_t.font.color.rgb = WHITE
            p_t.space_after = Pt(20)

        for i, item in enumerate(items):
            p = tf.add_paragraph() if (title or i > 0) else tf.paragraphs[0]
            p.text = f"→  {item}"
            p.font.size = Pt(font_size)
            p.font.color.rgb = LIGHT_TEXT
            p.space_after = Pt(16)

    def add_full_image_slide(slide, title, category, image_filename):
        # Small header
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_c = cat_box.text_frame
        p_c = tf_c.paragraphs[0]
        p_c.text = category.upper()
        p_c.font.size = Pt(14)
        p_c.font.bold = True
        p_c.font.color.rgb = PRIMARY

        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.8))
        tf = t_box.text_frame
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = WHITE

        # Image
        img_path = os.path.join(img_dir, image_filename)
        if os.path.exists(img_path):
            # Center large image
            slide.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), Inches(11.73), Inches(5.2))


    # ================== SLIDE 1 ==================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)
    add_hero(s1, "Student Management System", "Cloud-Native, Secure, and Elegant.")

    # ================== SLIDE 2 ==================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_split(s2, "The Problem", "Why Upgrade?", "Legacy systems are holding institutions back.", "Limitations of the Past", [
        "Data Loss: Paper registers and Excel files get corrupted.",
        "Device Locked: Stuck on a single office PC.",
        "No Security: Unrestricted access to private records.",
        "Slow Workflow: Manual searches take minutes, not milliseconds."
    ])

    # ================== SLIDE 3 ==================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_split(s3, "The Solution", "A New Standard", "Automated, secure, and beautiful.", "The Modern Solution", [
        "Cloud Sync: Instant real-time updates everywhere.",
        "Role Security: Strict Owner vs. Teacher access.",
        "Automation: 1-Click CSV bulk importing and exporting.",
        "Universal UX: Flawless on smartphones and desktops."
    ], is_right=True)

    # ================== SLIDE 4 ==================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    cat_box = s4.shapes.add_textbox(Inches(0.5), Inches(0.8), Inches(12.33), Inches(0.4))
    p_c = cat_box.text_frame.paragraphs[0]
    p_c.text = "ARCHITECTURE"
    p_c.font.size = Pt(14)
    p_c.font.bold = True
    p_c.font.color.rgb = PRIMARY
    p_c.alignment = PP_ALIGN.CENTER

    t_box = s4.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(12.33), Inches(0.8))
    p = t_box.text_frame.paragraphs[0]
    p.text = "The Technology Stack"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.CENTER

    add_card(s4, Inches(0.5), Inches(2.8), Inches(2.8), Inches(3.5), "Frontend", ["HTML5", "CSS3 Glassmorphism", "Vanilla JS for speed"], font_size=16)
    add_card(s4, Inches(3.6), Inches(2.8), Inches(2.8), Inches(3.5), "Backend", ["Node.js", "Express 5 API"], font_size=16)
    add_card(s4, Inches(6.7), Inches(2.8), Inches(2.8), Inches(3.5), "Database", ["TiDB Cloud", "Serverless MySQL"], font_size=16)
    add_card(s4, Inches(9.8), Inches(2.8), Inches(2.8), Inches(3.5), "Hosting", ["Render CI/CD", "Zero-downtime deploys"], font_size=16)

    # ================== SLIDE 5 ==================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_full_image_slide(s5, "Entity-Relationship Diagram", "DATABASE DESIGN", "er_diagram.png")

    # ================== SLIDE 6 ==================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    
    cat_box = s6.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.4))
    p_c = cat_box.text_frame.paragraphs[0]
    p_c.text = "SCHEMA DETAILS"
    p_c.font.size = Pt(14)
    p_c.font.bold = True
    p_c.font.color.rgb = PRIMARY
    
    t_box = s6.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(11.7), Inches(0.8))
    p = t_box.text_frame.paragraphs[0]
    p.text = "Database Highlights"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = WHITE

    add_card(s6, Inches(0.8), Inches(2.8), Inches(3.6), Inches(3.0), "Teachers Table", ["Stores Bcrypt hashes", "Tracks assigned courses", "Manages avatars"], font_size=16)
    add_card(s6, Inches(4.8), Inches(2.8), Inches(3.6), Inches(3.0), "Students Table", ["Strict age bounds (16-25)", "Unique emails", "1:N Teacher link"], font_size=16)
    add_card(s6, Inches(8.8), Inches(2.8), Inches(3.6), Inches(3.0), "Settings Table", ["Governs Invite Code", "Super Admin access only"], font_size=16)

    # ================== SLIDE 7 ==================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_full_image_slide(s7, "DFD Level 0: Boundaries", "SYSTEM CONTEXT", "dfd_level0_diagram.png")

    # ================== SLIDE 8 ==================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_full_image_slide(s8, "DFD Level 1: Modules", "SYSTEM PROCESSES", "dfd_level1_diagram.png")

    # ================== SLIDE 9 ==================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_split(s9, "Security", "Bulletproof Defense", "Enterprise-grade protection across all layers.", "Core Defenses", [
        "Cryptography: Bcrypt hashing prevents reverse-engineering.",
        "Network Guards: Strict IP rate limiting blocks brute-force.",
        "Sanitization: Malicious SQL payloads neutralized instantly."
    ])

    # ================== SLIDE 10 ==================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_full_image_slide(s10, "Process Logic Pipelines", "WORKFLOWS", "process_flow_diagram.png")

    # ================== SLIDE 11 ==================
    s11 = prs.slides.add_slide(blank_layout)
    set_bg(s11)
    add_full_image_slide(s11, "Use Case Diagram", "PRIVILEGES", "usecase_diagram.png")

    # ================== SLIDE 12 ==================
    s12 = prs.slides.add_slide(blank_layout)
    set_bg(s12)
    add_split(s12, "Verification", "Quality Assurance", "Ensuring flawless execution.", "Testing Strategy", [
        "Automated: Scripts validate REST endpoints & DB state.",
        "Boundary: Confirmed rejection of invalid ages.",
        "Uniqueness: 409 Conflict handled gracefully."
    ], is_right=True)

    # ================== SLIDE 13 ==================
    s13 = prs.slides.add_slide(blank_layout)
    set_bg(s13)
    add_hero(s13, "Built for the Future", "A massive leap to a secure, automated, scalable platform.", "SUMMARY")

    # ================== SLIDE 14 ==================
    s14 = prs.slides.add_slide(blank_layout)
    set_bg(s14)
    add_hero(s14, "Thank You", "Open for Questions & Discussion", "Q & A")

    # Save
    try:
        prs.save("Student_Management_System_Presentation_v2.pptx")
        print("Successfully saved 14-slide minimalist presentation.")
    except Exception as e:
        print(f"Error saving: {e}")

if __name__ == "__main__":
    build_presentation()
