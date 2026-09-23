import re

with open('about.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Target only the .how-we-work-grid CSS block
start_marker = '.how-we-work-grid {'
end_marker = '/* ===== SPEC VIDEO ===== */'

start_idx = html.find(start_marker)
end_idx = html.find(end_marker)

if start_idx != -1 and end_idx != -1:
    before = html[:start_idx]
    block = html[start_idx:end_idx]
    after = html[end_idx:]
    
    # Replace #B8B6AE with #191A17
    block = block.replace('#B8B6AE', '#191A17')
    
    new_html = before + block + after
    with open('about.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print('Replaced borders in grid CSS.')
else:
    print('Could not find markers.')
