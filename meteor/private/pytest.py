from PIL import Image
 
def get_average_color(xxx_todo_changeme, n, image):
    """ Returns a 3-tuple containing the RGB value of the average color of the
    given square bounded area of length = n whose origin (top left corner) 
    is (x, y) in the given image"""
    (x,y) = xxx_todo_changeme
    r, g, b = 0, 0, 0
    count = 0
    for s in range(x, x+n+1):
        for t in range(y, y+n+1):
            pixlr, pixlg, pixlb = image[s, t]
            r += pixlr
            g += pixlg
            b += pixlb
            count += 1
    return ((r/count), (g/count), (b/count))
 
image = Image.open('test.png').load()
r, g, b = get_average_color((24,290), 50, image)
print(r,g,b)