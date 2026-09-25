import imageio
import numpy as np
import sys

def make_pingpong(input_path, output_path):
    print(f"Reading {input_path}...")
    reader = imageio.get_reader(input_path)
    fps = reader.get_meta_data()['fps']
    
    frames = []
    for i, frame in enumerate(reader):
        frames.append(frame)
        
    print(f"Read {len(frames)} frames. Reversing...")
    # reverse frames but skip the very first and very last to make it perfectly smooth
    reversed_frames = frames[-2:0:-1]
    
    all_frames = frames + reversed_frames
    
    print(f"Writing {len(all_frames)} frames to {output_path} at {fps} fps...")
    writer = imageio.get_writer(output_path, fps=fps, macro_block_size=None)
    for frame in all_frames:
        writer.append_data(frame)
    writer.close()
    print("Done!")

if __name__ == "__main__":
    make_pingpong("hero-video.mp4", "hero-video-loop.mp4")
