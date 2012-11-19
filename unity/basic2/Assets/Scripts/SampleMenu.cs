using UnityEngine;

public class SampleMenu : MonoBehaviour {

	string playingName;
	GameObject playingObject;

	void PlaySample(string sampleName)
	{
		if (sampleName.CompareTo(playingName) == 0)
			return;

		if (playingObject != null)
			Destroy(playingObject);

		playingName = sampleName;
		playingObject = new GameObject(sampleName);
		playingObject.AddComponent<LWFSampleObject>();
	}

	void OnGUI()
	{
		GUI.Box(new Rect(10,10,100,120), "Menu");
		if (GUI.Button(new Rect(20,40,80,20), "Sample 1"))
			PlaySample("sample1_normal");
		if (GUI.Button(new Rect(20,70,80,20), "Sample 2"))
			PlaySample("sample2_normal");
		if (GUI.Button(new Rect(20,100,80,20), "Sample 3"))
			PlaySample("sample3_normal");
	}

}
