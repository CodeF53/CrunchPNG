# Crunch PNG (mmm tasty)
Web UI to losslessly optimize `.png` files in bulk

A tool to cut your `.png` files down to size, without losing quality, resolution, or detail.\
Enhance loading times by delivering streamlined and space-efficient content.\
Losslessly optimizes `.png`s using [Oxipng](https://github.com/shssoichiro/oxipng).

Most programs and apps that export `.png` images take a lazy approach to the encoding process in the interest of speed. This leaves two major areas of further compression which optimizers like [Oxipng](https://github.com/shssoichiro/oxipng) can take advantage of:
1. Choosing the proper Pixel Format. Many screenshot tools needlessly export their images as rgba (32 bits per pixel), even though screenshots are almost always completely opaque and can be stored as rgb (24 bits per pixel). Other programs may not properly check if the image they're exporting really needs color information at all. Adobe Lightroom, for example, will export black-and-white photographs as rgb rather than gray mode (8 bits per pixel). In some rare cases in which a `.png` image contains 256 or fewer different colors in total, a Palette mode can be used to shrink the image even further.
2. Testing all the PNG filter types. The PNG format specifies several different pixel-prediction algorithms that help transform the image data into a more compressible representation before the DEFLATE algorithm is applied. By running a more exhaustive search through all of the different filter types across each line of the image, it is often possible to uncover a more efficient method of describing the same image than was originally used.

This look good to you? [Check it out](https://crunchpng.f53.dev/):
![screenshot of the website](https://cdn.discordapp.com/attachments/754557554100535316/1116227968801456178/Screen_Shot_2023-06-07_at_22.49.321.png)
