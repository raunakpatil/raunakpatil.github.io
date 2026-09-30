import os

def fix_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

acts_dir = 'src/components/acts'

# Act4_Patterns: Don't fade out Zummit
fix_file(os.path.join(acts_dir, 'Act4_Patterns.tsx'), [
    ('useTransform(scrollYProgress, [0.80, 0.85, 0.95, 1.00], [0, 1, 1, 0])', 
     'useTransform(scrollYProgress, [0.80, 0.85, 0.95, 1.00], [0, 1, 1, 1])'),
    ('useTransform(scrollYProgress, [0.85, 0.90, 0.95, 1.00], [0, 1, 1, 0])',
     'useTransform(scrollYProgress, [0.85, 0.90, 0.95, 1.00], [0, 1, 1, 1])')
])

# Act4_Obsession: Start visible, stay visible
fix_file(os.path.join(acts_dir, 'Act4_Obsession.tsx'), [
    ('useTransform(scrollYProgress, [0.05, 0.15, 0.85, 0.95], [0, 1, 1, 0])',
     'useTransform(scrollYProgress, [0.05, 0.15, 0.85, 0.95], [1, 1, 1, 1])')
])

# Act5_SigmaAI: Start visible
fix_file(os.path.join(acts_dir, 'Act5_SigmaAI.tsx'), [
    ('useTransform(scrollYProgress, [0.05, 0.1, 0.15, 0.2], [0, 1, 1, 0])',
     'useTransform(scrollYProgress, [0.05, 0.1, 0.15, 0.2], [1, 1, 1, 0])')
])

# Act5_ProjectsTransition: Start visible, stay visible
fix_file(os.path.join(acts_dir, 'Act5_ProjectsTransition.tsx'), [
    ('useTransform(scrollYProgress, [0.05, 0.15, 0.85, 0.95], [0, 1, 1, 0])',
     'useTransform(scrollYProgress, [0.05, 0.15, 0.85, 0.95], [1, 1, 1, 1])')
])

print("Fixed pacing for empty swipes.")
