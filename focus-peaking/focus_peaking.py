import cv2
import numpy as np
import configparser


def load_config(config_file_path):
    config = configparser.ConfigParser()
    config.read(config_file_path)
    return config


def focus_peaking(frame, threshold=100, blur_kernel_size=(5, 5)):
    # Convert the frame to grayscale
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to the frame to reduce noise
    blurred_img = cv2.GaussianBlur(img, blur_kernel_size, 0)

    # Calculate the gradient magnitude using Sobel operators
    gradient_x = cv2.Sobel(blurred_img, cv2.CV_64F, 1, 0, ksize=3)
    gradient_y = cv2.Sobel(blurred_img, cv2.CV_64F, 0, 1, ksize=3)
    gradient_magnitude = np.sqrt(gradient_x ** 2 + gradient_y ** 2)

    # Convert the gradient magnitude to 8-bit image
    gradient_8bit = np.uint8(gradient_magnitude)

    # Threshold the gradient magnitude to find edges
    _, edges = cv2.threshold(gradient_8bit, threshold, 255, cv2.THRESH_BINARY)

    # Create a blank frame (black background)
    peaking_only = np.zeros_like(frame)

    # Apply red color to edges on the blank frame
    peaking_only[edges > 0] = [0, 0, 255]

    return peaking_only

def main(config_file_path, video_file_path):
    config = load_config(config_file_path)
    cap = cv2.VideoCapture(video_file_path)

    if not cap.isOpened():
        print("Error: Could not open the video file.")
        return

    # Fetch video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Define codec with H.264 compatibility
    fourcc = cv2.VideoWriter_fourcc(*'avc1')

    # Set up video writers
    original_writer = cv2.VideoWriter('original_video.mp4', fourcc, fps, (width, height))
    processed_writer = cv2.VideoWriter('focus_peaking_video.mp4', fourcc, fps, (width, height))

    threshold = int(config.get('FocusPeaking', 'Threshold'))
    blur_kernel_size = eval(config.get('FocusPeaking', 'BlurKernelSize'))

    frame_count = 0

    while frame_count < total_frames:
        ret, frame = cap.read()
        
        # # Handle frame-read failures explicitly
        # if not ret:
        #     # Write a black frame if frame couldn't be read (rare scenario)
        #     frame = np.zeros((height, width, 3), dtype=np.uint8)

        # Always write original frame
        original_writer.write(frame)

        # Always write processed frame, even if completely blank
        output_frame = focus_peaking(frame, threshold, blur_kernel_size)
        processed_writer.write(output_frame)

        frame_count += 1

    cap.release()
    original_writer.release()
    processed_writer.release()
    print("Processing complete. Videos saved as 'original_video.mp4' and 'focus_peaking_video.mp4'.")

if __name__ == "__main__":
    config_file_path = "config.ini"
    video_file_path = "video.mp4"  # Change to your video file path
    main(config_file_path, video_file_path)