using System.Collections.Generic;
using System.Collections;
using System.IO;
using System;
#if UNITY_EDITOR
using UnityEditor;
#endif
using UnityEngine;

public class Main : LWFObject
{
    public string inputLWF;
    public int numberOfFrames;
    public string outputDir;
    private RenderTexture _rtex;
    private Texture2D _tex;
    private int _count;

    public void Start()
    {
        Application.runInBackground = true;
#if UNITY_EDITOR
#else
        inputLWF = null;
        numberOfFrames = 0;
        outputDir = null;
        var args = Environment.GetCommandLineArgs();
        try {
            for (var i = 1; i < args.Length; i++) {
                if (! args[i].StartsWith("-")) {
                    if (inputLWF == null) {
                        inputLWF = args[i];
                    } else if (numberOfFrames == 0) {
                        numberOfFrames = int.Parse(args[i]);
                    } else if (outputDir == null) {
                        outputDir = args[i];
                    }
                }
            }
        } catch(Exception e) {
            Debug.Log(e);
            Debug.Log(e.StackTrace);
            Application.Quit();
            return;
        }
        if (string.IsNullOrEmpty(inputLWF) || numberOfFrames == 0 || string.IsNullOrEmpty(outputDir)) {
            Debug.Log(String.Format("Usage: {0} src.lwf num_of_frames dst_dir", args[0]));
            Application.Quit();
            return;
        }
#endif
        Time.captureDeltaTime = 1.0f / 30.0f;

        if (Directory.Exists(outputDir)) {
            Directory.Delete(outputDir, true);
        }
        Directory.CreateDirectory(outputDir);

        SetLoader(
            (filename) => {
                Debug.Log(filename);
                return File.ReadAllBytes(filename);
            },
            (filename) => {
                Debug.Log(filename);
                var bytes = File.ReadAllBytes(filename + ".png");
                var tex = new Texture2D(2, 2);
                tex.LoadImage(bytes);
                return tex;
            });
        Load(inputLWF, autoUpdate:false);

        ScaleForHeight((int)Camera.main.orthographicSize * 2);
        Move(-Camera.main.orthographicSize * lwf.width / lwf.height, -Camera.main.orthographicSize);

        _rtex = new RenderTexture((int)lwf.width, (int)lwf.height, 32, RenderTextureFormat.ARGB32);
        _rtex.Create();
        _tex = new Texture2D(_rtex.width, _rtex.height, TextureFormat.ARGB32, false, false);
        Camera.main.targetTexture = _rtex;

        _count = -10;
        UpdateLWF(0);
    }

    public void OnPostRender()
    {
        if (_count < 0 || numberOfFrames <= _count) {
            return;
        }
        RenderTexture.active = _rtex;
        _tex.ReadPixels(new Rect(0, 0, _tex.width, _tex.height), 0, 0);
        _tex.Apply();
        RenderTexture.active = null;
        var png = _tex.EncodeToPNG();
        File.WriteAllBytes(string.Format("{0}/{1:D4}.png", outputDir, _count), png);
    }

    public override void Update()
    {
        _count++;
        if (_count < 0) {
            return;
        } else if (numberOfFrames <= _count) {
#if UNITY_EDITOR
            EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
            return;
        }
        UpdateLWF(1.0f / 30.0f);
    }
}
