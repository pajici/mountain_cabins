package com.matf.pzv.services;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class ImageResizeService {

    public static class ResizedImages {
        private final byte[] display;
        private final byte[] thumb;

        public ResizedImages(byte[] display, byte[] thumb) {
            this.display = display;
            this.thumb = thumb;
        }

        public byte[] getDisplay() { return display; }
        public byte[] getThumb() { return thumb; }
    }

    public ResizedImages resize(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Only JPEG and PNG allowed");
        }
        BufferedImage src = ImageIO.read(file.getInputStream());
        BufferedImage display = Thumbnails.of(src).size(1280, 1280).outputQuality(0.85).asBufferedImage();
        BufferedImage thumb = Thumbnails.of(src).size(320, 320).outputQuality(0.8).asBufferedImage();

        byte[] displayBytes = toBytes(display, file.getContentType());
        byte[] thumbBytes = toBytes(thumb, file.getContentType());

        return new ResizedImages(displayBytes, thumbBytes);
    }

    private byte[] toBytes(BufferedImage img, String mimeType) throws IOException {
        String format = mimeType.equals("image/png") ? "png" : "jpg";
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, format, baos);
        return baos.toByteArray();
    }
}