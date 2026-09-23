import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace .main-header block
header_css = '''
.main-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 47px;
  padding: 0 40px;
  background-color: #191A17;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
'''
css = re.sub(r'\.main-header\s*\{.*?\}(?=\s*\.logo)', header_css.strip(), css, flags=re.DOTALL)

# Replace .logo block
logo_css = '''
.logo {
  grid-column: 1;
  position: absolute;
  top: -6px;
  left: 5px;
  font-family: 'Geist', sans-serif;
  font-weight: 100;
  font-size: 35px;
  line-height: 60px;
  letter-spacing: -0.09em;
  color: #F5F4EE;
  text-decoration: none;
  display: inline-block;
  width: 91px;
  height: 94px;
}
'''
css = re.sub(r'\.logo\s*\{.*?\}(?=\s*\.main-nav)', logo_css.strip(), css, flags=re.DOTALL)

# Replace .main-nav blocks
nav_css = '''
.main-nav {
  grid-column: 2;
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.main-nav a {
  color: #F5F4EE;
  text-decoration: none;
  font-family: 'Geist', sans-serif;
  font-weight: 400;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.main-nav a:hover {
  color: #e8e8e4;
}

.main-nav a.active {
  color: #F5F4EE;
}
'''
css = re.sub(r'\.main-nav\s*\{.*?\.main-nav a:hover\s*\{.*?\}', nav_css.strip(), css, flags=re.DOTALL)

# Add margin-top: 47px to .hero to compensate for fixed header
css = re.sub(r'(\.hero\s*\{[\s\S]*?)(?=\})', r'\1  margin-top: 47px;\n', css, count=1)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated header CSS in styles.css')
