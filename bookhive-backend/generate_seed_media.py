"""Script to generate unique, high-quality cover images and author profile avatars for BookHive."""

import os

from PIL import Image, ImageDraw

COVERS_DIR = os.path.join(os.path.dirname(__file__), "storage", "covers")
AUTHORS_DIR = os.path.join(os.path.dirname(__file__), "storage", "authors")

os.makedirs(COVERS_DIR, exist_ok=True)
os.makedirs(AUTHORS_DIR, exist_ok=True)

BOOK_STYLES = [
    ("Beyond Good and Evil", "Philosophy", (15, 23, 42), (30, 41, 59), (245, 158, 11)),
    ("The Forgotten Empire", "History", (67, 20, 7), (120, 36, 12), (234, 179, 8)),
    ("Silicon Dreams", "Technology", (6, 78, 59), (15, 118, 110), (52, 211, 153)),
    ("The Art of Stillness", "Personal Growth", (88, 28, 135), (126, 34, 206), (232, 121, 249)),
    ("Clean Architecture in Python", "Programming", (30, 58, 138), (29, 78, 216), (96, 165, 250)),
    ("Echoes of Tomorrow", "Sci-Fi Fiction", (17, 24, 39), (55, 65, 81), (129, 140, 248)),
    ("The Lean Startup Mindset", "Business", (124, 45, 18), (194, 65, 12), (251, 146, 60)),
    ("Cosmos and Consciousness", "Science", (12, 74, 110), (3, 105, 161), (56, 189, 248)),
    ("Quantum Mechanics Guide", "Physics", (88, 28, 135), (109, 40, 217), (167, 139, 250)),
    ("Designing for Humans", "Design", (159, 18, 57), (190, 18, 60), (251, 113, 133)),
    ("The Entrepreneur's Compass", "Business", (120, 53, 15), (180, 83, 9), (252, 211, 77)),
    ("Roots of History", "History", (57, 43, 27), (115, 87, 54), (217, 175, 120)),
    ("Mind Over Marathon", "Growth", (6, 95, 70), (4, 120, 87), (110, 231, 183)),
    ("The Silent Grove", "Mystery Fiction", (20, 83, 45), (22, 101, 52), (134, 239, 172)),
    ("Neural Networks Demystified", "AI / Coding", (30, 27, 75), (49, 46, 129), (165, 180, 252)),
    ("The Stoic CEO", "Philosophy", (31, 41, 55), (75, 85, 99), (209, 213, 219)),
    ("Brushstrokes of Light", "Art & Design", (131, 24, 67), (190, 24, 93), (244, 114, 182)),
    ("Shadows and Echoes", "Fiction", (15, 23, 42), (51, 65, 85), (148, 163, 184)),
    ("Data Without Borders", "Technology", (15, 118, 110), (13, 148, 136), (94, 234, 212)),
    ("The Unfinished Symphony", "Non-Fiction", (112, 26, 117), (162, 28, 175), (240, 171, 252)),
]

AUTHOR_PROFILES = [
    ("Eleanor Vance", "EV", (15, 23, 42), (245, 158, 11)),
    ("Dr. Sarah Chen", "SC", (12, 74, 110), (56, 189, 248)),
    ("Amir Hassan", "AH", (67, 20, 7), (234, 179, 8)),
    ("Yuki Tanaka", "YT", (6, 78, 59), (52, 211, 153)),
    ("Isabella Rossi", "IR", (88, 28, 135), (232, 121, 249)),
    ("Julian Thorne", "JT", (30, 58, 138), (96, 165, 250)),
    ("Noah Adeyemi", "NA", (124, 45, 18), (251, 146, 60)),
    ("Mei Lin", "ML", (159, 18, 57), (251, 113, 133)),
    ("Tariq Khalid", "TK", (120, 53, 15), (252, 211, 77)),
    ("Viktor Petrov", "VP", (31, 41, 55), (209, 213, 219)),
    ("Fatima Al-Zahra", "FA", (112, 26, 117), (240, 171, 252)),
]


def generate_book_covers():
    width, height = 600, 900
    for idx, (_title, _category, c1, c2, accent) in enumerate(BOOK_STYLES, start=1):
        img = Image.new("RGB", (width, height), c1)
        draw = ImageDraw.Draw(img)

        # Gradient background
        for y in range(height):
            r = int(c1[0] + (c2[0] - c1[0]) * (y / height))
            g = int(c1[1] + (c2[1] - c1[1]) * (y / height))
            b = int(c1[2] + (c2[2] - c1[2]) * (y / height))
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Outer decorative frame
        margin = 35
        draw.rectangle([margin, margin, width - margin, height - margin], outline=accent, width=4)
        draw.rectangle([margin + 8, margin + 8, width - margin - 8, height - margin - 8], outline=accent, width=1)

        # Central Emblem
        cx, cy = width // 2, height // 2 - 40
        r_size = 110
        draw.ellipse([cx - r_size, cy - r_size, cx + r_size, cy + r_size], outline=accent, width=3)
        draw.ellipse([cx - r_size + 15, cy - r_size + 15, cx + r_size - 15, cy + r_size - 15], outline=accent, width=1)

        # Central Diamond Shape
        draw.polygon([(cx, cy - 50), (cx + 50, cy), (cx, cy + 50), (cx - 50, cy)], fill=accent)

        # Category Badge Box
        draw.rectangle([cx - 120, margin + 50, cx + 120, margin + 85], fill=accent)

        cover_path = os.path.join(COVERS_DIR, f"cover_{idx}.jpg")
        img.save(cover_path, "JPEG", quality=92)
        print(f"Generated distinct cover #{idx}: {cover_path}")


def generate_author_avatars():
    width, height = 400, 400
    for idx, (_name, _initials, bg_color, accent_color) in enumerate(AUTHOR_PROFILES, start=1):
        img = Image.new("RGB", (width, height), bg_color)
        draw = ImageDraw.Draw(img)

        # Radial background lines or gradient rings
        cx, cy = width // 2, height // 2
        r = 160
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=bg_color, outline=accent_color, width=6)
        draw.ellipse([cx - r + 15, cy - r + 15, cx + r - 15, cy + r - 15], outline=accent_color, width=2)

        # Head / Shoulders silhouette avatar
        head_r = 45
        draw.ellipse([cx - head_r, cy - 50 - head_r, cx + head_r, cy - 50 + head_r], fill=accent_color)
        shoulder_rect = [cx - 85, cy + 20, cx + 85, cy + 120]
        draw.chord(shoulder_rect, start=180, end=0, fill=accent_color)

        avatar_path = os.path.join(AUTHORS_DIR, f"author_{idx}.jpg")
        img.save(avatar_path, "JPEG", quality=92)
        print(f"Generated distinct author avatar #{idx}: {avatar_path}")


if __name__ == "__main__":
    generate_book_covers()
    generate_author_avatars()
    print("All distinct media generated successfully!")
