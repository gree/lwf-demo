using UnityEngine;

[ExecuteInEditMode]
public class LWFSampleObject : LWFObject {

	void Start()
	{
		string dir = System.IO.Path.GetDirectoryName(lwfName);
		if (dir.Length > 0)
			dir += "/";

		if (Application.isEditor)
			UseDrawMeshRenderer();

		Load(lwfName, dir);
	}

}
