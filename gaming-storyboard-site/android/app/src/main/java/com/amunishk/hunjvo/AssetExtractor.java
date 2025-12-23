package com.amunishk.hunjvo;

import android.content.Context;
import android.content.res.AssetManager;
import java.io.*;

public class AssetExtractor {

    public static void copyAssetFolder(Context context, String src, File dest) throws IOException {
        AssetManager assetManager = context.getAssets();
        String[] files = assetManager.list(src);

        if (files == null || files.length == 0) {
            copyAssetFile(context, src, dest);
            return;
        }

        if (!dest.exists()) dest.mkdirs();

        for (String file : files) {
            copyAssetFolder(context, src + "/" + file, new File(dest, file));
        }
    }

    private static void copyAssetFile(Context context, String src, File dest) throws IOException {
        InputStream in = context.getAssets().open(src);
        OutputStream out = new FileOutputStream(dest);

        byte[] buffer = new byte[4096];
        int read;

        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }

        in.close();
        out.flush();
        out.close();
    }
}

