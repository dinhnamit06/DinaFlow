import sys
from PIL import Image

def is_bg_gray(p):
    r, g, b = p[:3]
    return max(r,g,b) - min(r,g,b) < 25

def remove_bg_floodfill(src, dest):
    print(f"Processing {src} -> {dest}...")
    try:
        img = Image.open(src).convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
        visited = set(queue)
        
        while queue:
            x, y = queue.pop(0)
            p = pixels[x, y]
            
            if p[3] > 0 and is_bg_gray(p):
                pixels[x, y] = (255, 255, 255, 0)
                
                for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
        img.save(dest, "PNG")
        print(f"Success: {dest}")
    except Exception as e:
        print(f"Error processing {src}: {e}")

if __name__ == "__main__":
    brain_dir = "C:/Users/Admin/.gemini/antigravity-ide/brain/03ac4ebc-393e-4bc2-968e-053b42b4ffea"
    images = {
        "conan-mascot.png": f"{brain_dir}/conan_mascot_genz_1782142987571.png",
        "ai-timer.png": f"{brain_dir}/ai_timer_genz_1782142997883.png",
        "ran-task.png": f"{brain_dir}/ran_task_genz_1782143009298.png",
        "kid-risk.png": f"{brain_dir}/kid_risk_genz_1782143020309.png",
        "heiji-note.png": f"{brain_dir}/heiji_note_genz_1782143032220.png"
    }
    
    for dest, src in images.items():
        remove_bg_floodfill(src, dest)
