import io
import time, datetime
import picamera
from numpy import *
from PIL import Image, ImageMath

class MotionDetection:
    def __init__(self):
        self.__image0 = None
        self.__image1 = None
        self.__image2 = None

        # Configuration parameters
        # Change to adjust sensitive of motion
        self._MOTION_LEVEL = 50000000
        self._THRESHOLD = 65

    def _updateImage(self, image):
        self.__image2 = self.__image1
        self.__image1 = self.__image0
        self.__image0 = image

    def _ready(self):
        return self.__image0 != None and self.__image1 != None and self.__image2 != None

    def _getMotion(self):
        if not self._ready():
            return None

        d1 = abs(self.__image1 - self.__image0)
        d2 = abs(self.__image2 - self.__image0)
        result = d1 & d2

        result[result > self._THRESHOLD] = 255
        result[result <= self._THRESHOLD] = 0

        scalar = result.sum()

        print(' - scalar:', scalar)
        return scalar

    def detectMotion(self, image):
        self._updateImage(image)

        motion = self._getMotion()
        if motion and motion > self._MOTION_LEVEL:
            return True
        return False

    def saveImage(self, file_path, file_name):
        image = Image.fromarray(self.__image0)
        img.save(file_path + '/' + file_name)
        print('Image saved at ' + file_path + '/' + file_name)

def process():

    print('Initializing camera...')
    with picamera.PiCamera() as camera:
        camera.resolution = (800,600)
        camera.start_preview()
        print("Setting focus and light level on camera...")
        time.sleep(2)

        print("Initializing motion detection...")
        detection = MotionDetection()

        count = 0

        while True:
            print('Capturing picture...')
            stream = io.BytesIO()
            camera.capture(stream, format = 'rgba', use_video_port = True)

            imageData = fromstring(stream.getvalue(), dtype = uint8)

            if detection.detectMotion(imageData):
                print('Motion detected at ' + datetime.datetime.now().strftime("%Y-%m-%d-%H%M%S"))
                '''tstmp = datetime.datetime.now().strftime("%Y-%m-%d-%H%M%S")
                image_file = 'capture_%s_%05d.jpg' % (tstmp, count)
                count += 1
                detection.saveImage('capture/', image_file)'''

            stream.seek(0)
            #time.sleep(1)

if __name__ == "__main__":
        process()