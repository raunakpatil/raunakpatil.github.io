import os, glob

def inject_hardware_accel():
    base_dir = "src/components/acts"
    files = glob.glob(os.path.join(base_dir, "Act*.tsx"))
    
    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Add will-change-transform to any motion.div that doesn't have it yet but has style={{ opacity... }}
        # Wait, the best way to do this safely is replacing '<motion.div style={{ opacity' with '<motion.div className="will-change-transform" style={{ opacity'
        
        content = content.replace('<motion.div style={{ opacity', '<motion.div className="will-change-transform" style={{ opacity')
        content = content.replace('<motion.g style={{ opacity', '<motion.g className="will-change-transform" style={{ opacity')
        
        # In case the original had className before style
        content = content.replace('<motion.div className="absolute', '<motion.div className="will-change-transform absolute')
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

if __name__ == "__main__":
    inject_hardware_accel()
    print("Injected hardware acceleration classes.")
