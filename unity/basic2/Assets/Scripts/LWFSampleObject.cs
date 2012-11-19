using UnityEngine;

public class LWFSampleObject : LWFObject {

	void Start()
	{
		string dir = string.Format("LWF/{0}/", name);
		string path = dir + name;

		Camera camera = GameObject.Find("LWF Camera").camera;
		gameObject.layer = camera.gameObject.layer;

		Load(path:path, texturePrefix:dir, camera:camera);

		camera.rect = new Rect(0, 0, 1, 1);
		int height = (int)camera.orthographicSize * 2;
		FitForHeight(height);

		float w = lwf.width / (camera.aspect * lwf.height);
		camera.rect = new Rect((1 - w) / 2.0f, 0, w, 1);
	}

}
