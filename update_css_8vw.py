import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Change .contact-section padding to 40px 8vw
css = re.sub(r'\.contact-section\s*\{\s*background-color:\s*#49545B;\s*/\*\s*Muted slate-blue\s*\*/\s*padding:\s*40px\s+40px;',
             r'.contact-section {\n  background-color: #49545B; /* Muted slate-blue */\n  padding: 40px 8vw;', css)

# Change .footer-section padding to 5px 8vw 0px 8vw
css = re.sub(r'\.footer-section\s*\{\s*background-color:\s*#1a1a1a;\s*border-top:\s*1px\s+solid\s+#333;\s*padding:\s*5px\s+40px\s+0px\s+40px;',
             r'.footer-section {\n  background-color: #1a1a1a;\n  border-top: 1px solid #333;\n  padding: 5px 8vw 0px 8vw;', css)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
