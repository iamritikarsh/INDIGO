import re

# Read files
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

with open('styles.css', 'r', encoding='utf-8') as f:
    styles_css = f.read()

with open('about.html', 'r', encoding='utf-8') as f:
    about_html = f.read()

# 1. Extract HTML
hww_html_match = re.search(r'(<div class="how-we-work-grid">.*?</div>)\s*(?=</section>|<div class="who-we-serve-section">)', index_html, re.DOTALL)
if not hww_html_match:
    print("Could not find HOW WE WORK grid in index.html")
    exit(1)
hww_html = hww_html_match.group(1)

# 2. Extract CSS
hww_css_match = re.search(r'/\* ===== HOW WE WORK GRID ===== \*/.*?(?=/\* ===== WHO WE SERVE SECTION ===== \*/)', styles_css, re.DOTALL)
if not hww_css_match:
    print("Could not find HOW WE WORK CSS in styles.css")
    exit(1)
hww_css = hww_css_match.group(0)

# 3. Modify CSS
# Background colors
hww_css = hww_css.replace('#1a1a1a', '#E2E0D7')
# Borders
hww_css = re.sub(r'(border[a-zA-Z-]*:\s*1px\s*solid\s*)#D3D1C8', r'\1#B8B6AE', hww_css)
# Text color
hww_css = hww_css.replace('color: #D3D1C8', 'color: #191A17')

# Add a wrapper for the new section to match the about page styling if needed, or just insert
new_html_section = '<!-- ===== HOW WE WORK SECTION ===== -->\n  <section class="hww-section-new" style="background-color: #E2E0D7; width: 100%; border-bottom: 1px solid #B8B6AE;">\n    ' + hww_html + '\n  </section>'

# 4. Replace HTML in about.html
about_html = re.sub(r'<!-- ===== HOW WE WORK SECTION ===== -->.*?</section>\s*(?=<!-- ===== EDITORIAL MASONRY GRID ===== -->)', new_html_section + '\n\n  ', about_html, flags=re.DOTALL)

# 5. Replace CSS in about.html
about_html = re.sub(r'/\* ===== HOW WE WORK SECTION ===== \*/.*?(?=/\* ===== EDITORIAL MASONRY GRID ===== \*/)', hww_css + '\n\n    ', about_html, flags=re.DOTALL)

with open('about.html', 'w', encoding='utf-8') as f:
    f.write(about_html)

print("Successfully replaced.")
