from PIL import Image
import sys

def fix_bg(img_path):
    try:
        # Open and convert to grayscale to act as our alpha mask
        img_gray = Image.open(img_path).convert("L")
        
        # We want the glowing color to be the volt green: (126, 200, 67)
        # We'll create a solid color image of the exact same size
        solid_color = Image.new("RGBA", img_gray.size, (126, 200, 67, 255))
        
        # Now we apply the grayscale image as the alpha channel
        # Black (0) becomes fully transparent, White (255) becomes fully opaque
        solid_color.putalpha(img_gray)
        
        # Save over the original
        solid_color.save(img_path, "PNG")
        print("Successfully made background transparent with perfect glowing edges!")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    fix_bg(r"c:\Users\horor\OneDrive\سطح المكتب\voltech\public\neon-earth.png")
